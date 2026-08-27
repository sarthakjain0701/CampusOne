/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - LIBRARY BACKEND SERVICE
   Firebase Firestore Adapter for all Library operations.
   ========================================================================== */

const LibraryBackendService = {
  db: null,
  listeners: [],

  init() {
    if (!this.db && window.FirebaseService && window.FirebaseService.db) {
      this.db = window.FirebaseService.db;
    }
  },

  stopListening() {
    this.listeners.forEach(unsub => unsub());
    this.listeners = [];
  },

  // --- BOOKS ---
  async getBooks(callback) {
    this.init();
    if (!this.db) return;
    const unsub = this.db.collection('libraryBooks').onSnapshot(snapshot => {
      const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (callback) callback(books);
    }, err => console.error("Error fetching books:", err));
    this.listeners.push(unsub);
  },

  async addBook(bookData) {
    this.init();
    bookData.createdAt = new Date().toISOString();
    bookData.updatedAt = new Date().toISOString();
    bookData.availableCopies = parseInt(bookData.totalCopies || 0);
    bookData.issuedCopies = 0;
    bookData.reservedCopies = 0;
    
    const docRef = await this.db.collection('libraryBooks').add(bookData);
    
    // Auto-generate generic copies based on totalCopies
    for (let i = 0; i < bookData.availableCopies; i++) {
      await this.db.collection('libraryBookCopies').add({
        bookId: docRef.id,
        copyNumber: `COPY-${i + 1}`,
        status: 'AVAILABLE',
        condition: 'NEW',
        addedAt: new Date().toISOString()
      });
    }
    return docRef.id;
  },

  async updateBook(bookId, data) {
    this.init();
    data.updatedAt = new Date().toISOString();
    await this.db.collection('libraryBooks').doc(bookId).update(data);
  },

  async getBookCopies(bookId, callback) {
    this.init();
    const unsub = this.db.collection('libraryBookCopies').where('bookId', '==', bookId).onSnapshot(snapshot => {
      const copies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (callback) callback(copies);
    });
    this.listeners.push(unsub);
  },

  // --- CIRCULATION (ISSUE / RETURN) ---
  async getTransactions(callback) {
    this.init();
    const unsub = this.db.collection('libraryTransactions').onSnapshot(snapshot => {
      const tx = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (callback) callback(tx);
    });
    this.listeners.push(unsub);
  },

  async issueBook(memberEmail, bookId, copyId) {
    this.init();
    const batch = this.db.batch();
    
    const bookRef = this.db.collection('libraryBooks').doc(bookId);
    const copyRef = this.db.collection('libraryBookCopies').doc(copyId);
    const txRef = this.db.collection('libraryTransactions').doc();

    const bookDoc = await bookRef.get();
    if (!bookDoc.exists) throw new Error("Book not found.");
    const bookData = bookDoc.data();
    if (bookData.availableCopies <= 0) throw new Error("No copies available.");

    const copyDoc = await copyRef.get();
    if (!copyDoc.exists || copyDoc.data().status !== 'AVAILABLE') throw new Error("Copy not available.");

    batch.update(bookRef, {
      availableCopies: bookData.availableCopies - 1,
      issuedCopies: (bookData.issuedCopies || 0) + 1
    });

    batch.update(copyRef, { status: 'ISSUED' });

    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Default 7 days

    batch.set(txRef, {
      memberEmail: memberEmail,
      bookId: bookId,
      copyId: copyId,
      issueDate: issueDate.toISOString(),
      dueDate: dueDate.toISOString(),
      status: 'ISSUED',
      renewalCount: 0,
      createdAt: issueDate.toISOString()
    });

    await batch.commit();
    return txRef.id;
  },

  async returnBook(transactionId, fineAmount = 0) {
    this.init();
    const txRef = this.db.collection('libraryTransactions').doc(transactionId);
    const txDoc = await txRef.get();
    if (!txDoc.exists) throw new Error("Transaction not found");
    const tx = txDoc.data();

    const bookRef = this.db.collection('libraryBooks').doc(tx.bookId);
    const copyRef = this.db.collection('libraryBookCopies').doc(tx.copyId);
    
    const bookDoc = await bookRef.get();
    const bookData = bookDoc.data();

    const batch = this.db.batch();

    batch.update(txRef, {
      status: 'RETURNED',
      returnDate: new Date().toISOString(),
      fineCalculated: fineAmount
    });

    batch.update(copyRef, { status: 'AVAILABLE' });

    batch.update(bookRef, {
      availableCopies: bookData.availableCopies + 1,
      issuedCopies: bookData.issuedCopies - 1
    });

    if (fineAmount > 0) {
      const fineRef = this.db.collection('libraryFines').doc();
      batch.set(fineRef, {
        memberEmail: tx.memberEmail,
        transactionId: transactionId,
        amount: fineAmount,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      });
    }

    await batch.commit();
  },

  // --- FINES ---
  async getFines(callback) {
    this.init();
    const unsub = this.db.collection('libraryFines').onSnapshot(snapshot => {
      const fines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (callback) callback(fines);
    });
    this.listeners.push(unsub);
  },

  async payFine(fineId) {
    this.init();
    await this.db.collection('libraryFines').doc(fineId).update({
      status: 'PAID',
      paidAt: new Date().toISOString()
    });
  },

  // --- MEMBERS ---
  async searchMembers(query) {
    this.init();
    // In a real app we'd use Algolia or similar, but for now we'll fetch authorizedUsers and filter
    const snapshot = await this.db.collection('authorizedUsers').get();
    const students = snapshot.docs.map(doc => doc.data());
    const facultySnap = await this.db.collection('faculties').get();
    const faculties = facultySnap.docs.map(doc => doc.data());
    
    const all = [...students, ...faculties];
    const lowerQuery = query.toLowerCase();
    
    return all.filter(u => 
      (u.name && u.name.toLowerCase().includes(lowerQuery)) || 
      (u.email && u.email.toLowerCase().includes(lowerQuery)) ||
      (u.rollNumber && u.rollNumber.toLowerCase().includes(lowerQuery))
    );
  }
};

window.LibraryBackendService = LibraryBackendService;

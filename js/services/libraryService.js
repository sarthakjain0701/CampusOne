/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - LIBRARY SERVICE (FIRESTORE)
   Comprehensive Library Operations
   ========================================================================== */

const LibraryService = {
  db: null,
  listeners: [],

  _getDb() {
    if (!this.db && window.FirebaseService && window.FirebaseService.db) {
      this.db = window.FirebaseService.db;
    }
    if (!this.db) {
      throw new Error("Firestore database is not initialized.");
    }
    return this.db;
  },

  // ------------------------------------------------------------------------
  // BOOKS
  // ------------------------------------------------------------------------
  async getBooks() {
    const db = this._getDb();
    const snapshot = await db.collection('libraryBooks').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getBook(bookId) {
    const db = this._getDb();
    const doc = await db.collection('libraryBooks').doc(bookId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async addBook(bookData) {
    const db = this._getDb();
    const newBookRef = db.collection('libraryBooks').doc();
    const payload = {
      ...bookData,
      totalCopies: 0,
      availableCopies: 0,
      issuedCopies: 0,
      reservedCopies: 0,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await newBookRef.set(payload);
    return { id: newBookRef.id, ...payload };
  },

  async updateBook(bookId, updates) {
    const db = this._getDb();
    const payload = { ...updates, updatedAt: new Date().toISOString() };
    await db.collection('libraryBooks').doc(bookId).update(payload);
  },

  // ------------------------------------------------------------------------
  // BOOK COPIES
  // ------------------------------------------------------------------------
  async getBookCopies(bookId) {
    const db = this._getDb();
    const snapshot = await db.collection('libraryBookCopies').where('bookId', '==', bookId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async addCopies(bookId, numberOfCopies, condition = 'GOOD') {
    const db = this._getDb();
    const bookDoc = await db.collection('libraryBooks').doc(bookId).get();
    if (!bookDoc.exists) throw new Error("Book not found.");
    
    const batch = db.batch();
    for(let i=0; i<numberOfCopies; i++) {
      const copyRef = db.collection('libraryBookCopies').doc();
      batch.set(copyRef, {
        bookId,
        status: 'AVAILABLE',
        condition,
        createdAt: new Date().toISOString()
      });
    }

    // Update book inventory
    const currentBook = bookDoc.data();
    batch.update(bookDoc.ref, {
      totalCopies: currentBook.totalCopies + numberOfCopies,
      availableCopies: currentBook.availableCopies + numberOfCopies,
      updatedAt: new Date().toISOString()
    });

    await batch.commit();
  },

  // ------------------------------------------------------------------------
  // CIRCULATION (ISSUE & RETURN)
  // ------------------------------------------------------------------------
  async issueBook(userId, bookId, copyId) {
    const db = this._getDb();
    
    // Validate User (Basic checks)
    if (!userId || !bookId) throw new Error("Invalid parameters.");

    // Using Firestore Transactions for atomicity
    return await db.runTransaction(async (transaction) => {
      const bookRef = db.collection('libraryBooks').doc(bookId);
      const copyRef = db.collection('libraryBookCopies').doc(copyId);
      
      const [bookDoc, copyDoc] = await Promise.all([
        transaction.get(bookRef),
        transaction.get(copyRef)
      ]);

      if (!bookDoc.exists || !copyDoc.exists) throw new Error("Book or Copy not found.");
      if (copyDoc.data().status !== 'AVAILABLE') throw new Error("This physical copy is not available.");
      
      const currentBook = bookDoc.data();
      if (currentBook.availableCopies <= 0) throw new Error("No available copies for this book.");

      // Calculate Due Date (Default 14 days)
      const issueDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const transRef = db.collection('libraryTransactions').doc();
      const newTransaction = {
        userId,
        bookId,
        copyId,
        bookTitle: currentBook.title,
        issueDate: issueDate.toISOString(),
        dueDate: dueDate.toISOString(),
        returnDate: null,
        status: 'ISSUED',
        fineAmount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 1. Create Transaction
      transaction.set(transRef, newTransaction);
      
      // 2. Update Copy Status
      transaction.update(copyRef, { status: 'ISSUED', currentTransactionId: transRef.id, updatedAt: new Date().toISOString() });

      // 3. Update Book Inventory
      transaction.update(bookRef, {
        availableCopies: currentBook.availableCopies - 1,
        issuedCopies: currentBook.issuedCopies + 1,
        updatedAt: new Date().toISOString()
      });

      return { id: transRef.id, ...newTransaction };
    });
  },

  async returnBook(transactionId) {
    const db = this._getDb();

    return await db.runTransaction(async (transaction) => {
      const transRef = db.collection('libraryTransactions').doc(transactionId);
      const transDoc = await transaction.get(transRef);

      if (!transDoc.exists) throw new Error("Transaction not found.");
      const tData = transDoc.data();
      if (tData.status === 'RETURNED') throw new Error("Book already returned.");

      const bookRef = db.collection('libraryBooks').doc(tData.bookId);
      const copyRef = db.collection('libraryBookCopies').doc(tData.copyId);

      const [bookDoc, copyDoc] = await Promise.all([
        transaction.get(bookRef),
        transaction.get(copyRef)
      ]);

      // Calculate any pending fine
      const today = new Date();
      const dueDate = new Date(tData.dueDate);
      let fineAmount = 0;
      if (today > dueDate) {
        const diffTime = Math.abs(today - dueDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        fineAmount = diffDays * 5; // 5 Rs per day
      }

      // 1. Update Transaction
      transaction.update(transRef, {
        returnDate: today.toISOString(),
        status: 'RETURNED',
        fineAmount: fineAmount,
        updatedAt: new Date().toISOString()
      });

      // 2. Update Copy Status
      if (copyDoc.exists) {
        transaction.update(copyRef, { status: 'AVAILABLE', currentTransactionId: null, updatedAt: new Date().toISOString() });
      }

      // 3. Update Book Inventory
      if (bookDoc.exists) {
        const bData = bookDoc.data();
        transaction.update(bookRef, {
          availableCopies: bData.availableCopies + 1,
          issuedCopies: Math.max(0, bData.issuedCopies - 1),
          updatedAt: new Date().toISOString()
        });
      }

      // 4. Create Fine record if applicable
      if (fineAmount > 0) {
        const fineRef = db.collection('libraryFines').doc();
        transaction.set(fineRef, {
          userId: tData.userId,
          transactionId: transRef.id,
          amount: fineAmount,
          status: 'PENDING',
          createdAt: new Date().toISOString()
        });
      }

      return true;
    });
  },

  // ------------------------------------------------------------------------
  // DASHBOARD & ANALYTICS
  // ------------------------------------------------------------------------
  async getDashboardStats() {
    const db = this._getDb();
    const stats = {
      totalBooks: 0,
      totalCopies: 0,
      availableCopies: 0,
      issuedCopies: 0,
      overdueCount: 0,
      pendingFinesTotal: 0
    };

    // Books Aggregation
    const books = await db.collection('libraryBooks').get();
    stats.totalBooks = books.size;
    books.forEach(doc => {
      const data = doc.data();
      stats.totalCopies += (data.totalCopies || 0);
      stats.availableCopies += (data.availableCopies || 0);
      stats.issuedCopies += (data.issuedCopies || 0);
    });

    // Fines Aggregation
    const fines = await db.collection('libraryFines').where('status', '==', 'PENDING').get();
    fines.forEach(doc => {
      stats.pendingFinesTotal += (doc.data().amount || 0);
    });

    // Overdue Approximation
    const todayStr = new Date().toISOString();
    const overdue = await db.collection('libraryTransactions')
                            .where('status', 'in', ['ISSUED', 'OVERDUE'])
                            .where('dueDate', '<', todayStr)
                            .get();
    stats.overdueCount = overdue.size;

    return stats;
  },

  // ------------------------------------------------------------------------
  // REAL-TIME LISTENERS
  // ------------------------------------------------------------------------
  listenToActiveTransactions(callback) {
    const db = this._getDb();
    const unsubscribe = db.collection('libraryTransactions')
      .where('status', 'in', ['ISSUED', 'OVERDUE'])
      .onSnapshot(snapshot => {
        const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(transactions);
      });
    this.listeners.push(unsubscribe);
    return unsubscribe;
  },
  
  listenToBooks(callback) {
    const db = this._getDb();
    const unsubscribe = db.collection('libraryBooks')
      .onSnapshot(snapshot => {
        const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(books);
      });
    this.listeners.push(unsubscribe);
    return unsubscribe;
  },

  stopListening() {
    this.listeners.forEach(unsub => unsub());
    this.listeners = [];
  }
};

window.LibraryService = LibraryService;

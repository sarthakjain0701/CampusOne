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
  async getBooks(limitCount = 50, lastVisible = null) {
    const db = this._getDb();
    let query = db.collection('libraryBooks').orderBy('title').limit(limitCount);
    if (lastVisible) {
      query = query.startAfter(lastVisible);
    }
    const snapshot = await query.get();
    return {
      books: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      lastVisible: snapshot.docs[snapshot.docs.length - 1] || null
    };
  },

  async searchBooks(searchQuery, limitCount = 50) {
    const db = this._getDb();
    if (!searchQuery) {
      const snap = await db.collection('libraryBooks').orderBy('title').limit(limitCount).get();
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    // Support prefix search with Title Case
    const upperQuery = searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1);
    const snapshot = await db.collection('libraryBooks')
      .where('title', '>=', upperQuery)
      .where('title', '<=', upperQuery + '\uf8ff')
      .limit(limitCount)
      .get();
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
  // ------------------------------------------------------------------------
  // DASHBOARD & ANALYTICS (PARALLELIZED QUERIES)
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

    const todayStr = new Date().toISOString();

    try {
      // Parallelize independent collection queries
      const [booksSnap, finesSnap, overdueSnap] = await Promise.all([
        db.collection('libraryBooks').limit(200).get(),
        db.collection('libraryFines').where('status', '==', 'PENDING').limit(100).get(),
        db.collection('libraryTransactions')
          .where('status', 'in', ['ISSUED', 'OVERDUE'])
          .where('dueDate', '<', todayStr)
          .limit(100)
          .get()
      ]);

      // Process Books Aggregation
      stats.totalBooks = booksSnap.size || 0;
      booksSnap.forEach(doc => {
        const data = doc.data();
        stats.totalCopies += (data.totalCopies || 0);
        stats.availableCopies += (data.availableCopies || 0);
        stats.issuedCopies += (data.issuedCopies || 0);
      });

      // Process Fines Aggregation
      finesSnap.forEach(doc => {
        stats.pendingFinesTotal += (doc.data().amount || 0);
      });

      // Process Overdue Aggregation
      stats.overdueCount = overdueSnap.size || 0;

      return stats;
    } catch (err) {
      console.error("Failed to load library dashboard stats in parallel:", err);
      throw new Error("Unable to load library dashboard statistics.");
    }
  },

  // ------------------------------------------------------------------------
  // REAL-TIME LISTENERS
  // ------------------------------------------------------------------------
  listenToActiveTransactions(callback) {
    this.stopListening(); // Ensure previous listeners are cleaned up before starting a new one
    const db = this._getDb();
    const unsubscribe = db.collection('libraryTransactions')
      .where('status', 'in', ['ISSUED', 'OVERDUE'])
      .limit(100)
      .onSnapshot(snapshot => {
        const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(transactions);
      });
    this.listeners.push(unsubscribe);
    return unsubscribe;
  },
  
  listenToBooks(callback) {
    this.stopListening(); // Ensure previous listeners are cleaned up before starting a new one
    const db = this._getDb();
    const unsubscribe = db.collection('libraryBooks')
      .limit(100)
      .onSnapshot(snapshot => {
        const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(books);
      });
    this.listeners.push(unsubscribe);
    return unsubscribe;
  },

  
  async getStudentLibraryHistory(studentId) {
    try {
      const db = this._getDb();
      if (!studentId) return [];
      const snapshot = await db.collection('libraryTransactions')
        .where('userId', '==', studentId)
        .get();
      
      let records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (records.length === 0) {
        const altSnapshot = await db.collection('libraryTransactions')
          .where('studentId', '==', studentId)
          .get();
        records = altSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      return records;
    } catch (err) {
      console.error("Failed to fetch student library history from Firestore:", err);
      return [];
    }
  },

  async seedTestData() {
    try {
      const db = this._getDb();
      // Check if test data exists
      const testCheck = await db.collection('libraryBooks').where('isTestData', '==', true).limit(1).get();
      if (!testCheck.empty) {
        throw new Error("Test data already seeded. Refresh to view.");
      }

      const booksData = [
        { title: "Data Structures and Algorithms", author: "Mark Allen Weiss", isbn: "9780132576277", category: "Computer Science", total: 5 },
        { title: "Introduction to Algorithms", author: "Thomas H. Cormen", isbn: "9780262033848", category: "Computer Science", total: 3 },
        { title: "Calculus: Early Transcendentals", author: "James Stewart", isbn: "9781285741550", category: "Mathematics", total: 4 },
        { title: "Physics for Scientists and Engineers", author: "Raymond A. Serway", isbn: "9781133947271", category: "Physics", total: 3 },
        { title: "Digital Design", author: "M. Morris Mano", isbn: "9780132774208", category: "Electronics", total: 2 },
        { title: "Engineering Mechanics: Statics", author: "R. C. Hibbeler", isbn: "9780133918922", category: "Engineering", total: 4 },
        { title: "The C Programming Language", author: "Brian W. Kernighan", isbn: "9780131103627", category: "Computer Science", total: 6 },
        { title: "Clean Code", author: "Robert C. Martin", isbn: "9780132350884", category: "Computer Science", total: 3 },
        { title: "Advanced Engineering Mathematics", author: "Erwin Kreyszig", isbn: "9780470458365", category: "Mathematics", total: 5 },
        { title: "Modern Control Engineering", author: "Katsuhiko Ogata", isbn: "9780136156734", category: "Engineering", total: 2 }
      ];

      const createdBooks = [];
      for (const b of booksData) {
        const bookRef = db.collection('libraryBooks').doc();
        const bookDoc = {
          title: b.title,
          author: b.author,
          isbn: b.isbn,
          category: b.category,
          totalCopies: b.total,
          availableCopies: b.total,
          issuedCopies: 0,
          reservedCopies: 0,
          status: 'ACTIVE',
          isTestData: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await bookRef.set(bookDoc);
        createdBooks.push({ id: bookRef.id, ...bookDoc });

        // Add copies
        const batch = db.batch();
        for(let i=0; i<b.total; i++) {
          const copyRef = db.collection('libraryBookCopies').doc();
          batch.set(copyRef, {
            bookId: bookRef.id,
            status: 'AVAILABLE',
            condition: 'GOOD',
            isTestData: true,
            createdAt: new Date().toISOString()
          });
        }
        await batch.commit();
      }

      // Fetch up to 3 students to use as test borrowers
      const studentSnap = await db.collection('authorizedUsers').where('role', '==', 'STUDENT').limit(3).get();
      const students = studentSnap.docs.map(doc => ({ id: doc.id, email: doc.id, ...doc.data() }));

      if (students.length > 0) {
        const now = new Date();
        const pastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const overdueDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        
        const student1 = students[0];
        const student2 = students[1] || students[0];
        const student3 = students[2] || students[0];

        const copies1 = await this.getBookCopies(createdBooks[0].id);
        const copies2 = await this.getBookCopies(createdBooks[1].id);
        const copies3 = await this.getBookCopies(createdBooks[2].id);

        // 1. ACTIVE (ISSUED)
        if (copies1.length > 0) {
          const t1 = await this.issueBook(student1.id, createdBooks[0].id, copies1[0].id);
          await db.collection('libraryTransactions').doc(t1.id).update({
             memberEmail: student1.email || student1.id,
             isTestData: true
          });
        }
        
        // 2. OVERDUE
        if (copies2.length > 0) {
          const t2 = await this.issueBook(student2.id, createdBooks[1].id, copies2[0].id);
          await db.collection('libraryTransactions').doc(t2.id).update({
            issueDate: pastMonth.toISOString(),
            dueDate: overdueDate.toISOString(),
            status: 'OVERDUE',
            memberEmail: student2.email || student2.id,
            isTestData: true
          });
          // Add fine
          await db.collection('libraryFines').doc().set({
            userId: student2.id,
            memberEmail: student2.email || student2.id,
            transactionId: t2.id,
            amount: 15, // 5 Rs/day * 3 days
            status: 'PENDING',
            isTestData: true,
            createdAt: new Date().toISOString()
          });
        }
        
        // 3. RETURNED
        if (copies3.length > 0) {
          const t3 = await this.issueBook(student3.id, createdBooks[2].id, copies3[0].id);
          await db.collection('libraryTransactions').doc(t3.id).update({
             memberEmail: student3.email || student3.id,
             isTestData: true
          });
          await this.returnBook(t3.id);
        }
      }
      return true;
    } catch (err) {
      console.error("Test Data Seeding failed", err);
      throw err;
    }
  },
  stopListening() {
    if (this.listeners && this.listeners.length > 0) {
      this.listeners.forEach(unsub => unsub && typeof unsub === 'function' && unsub());
      this.listeners = [];
    }
  }
};

window.LibraryService = LibraryService;

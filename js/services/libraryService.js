/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - LIBRARY SERVICE
   Supports Student & Faculty Library History, Fine Calculation, Issue & Return
   ========================================================================== */

const LibraryService = {
  getAllRecords() {
    return DataStore.get('LIBRARY_RECORDS') || [];
  },

  getStudentIssuedBooks(studentId) {
    const records = this.getAllRecords().filter(r => r.studentId === studentId || r.studentId === "STU001");
    // Update overdue status and fines dynamically before returning
    return records.map(r => this.calculateOverdueStatus(r));
  },

  getStudentLibraryHistory(studentId) {
    return this.getStudentIssuedBooks(studentId);
  },

  getStudentOverdueBooks(studentId) {
    return this.getStudentIssuedBooks(studentId).filter(r => r.returnStatus === 'OVERDUE');
  },

  getStudentFines(studentId) {
    return this.getStudentIssuedBooks(studentId).filter(r => r.fineAmount > 0);
  },

  /**
   * Calculates detailed library status & eligibility summary for any user (Student or Faculty)
   */
  getLibraryStatusForUser(userId) {
    const all = this.getAllRecords();
    const userRecords = all.filter(r => r.studentId === userId || r.userId === userId);
    const calculated = userRecords.map(r => this.calculateOverdueStatus(r));

    const activeIssued = calculated.filter(r => r.returnStatus !== 'RETURNED');
    const overdueBooks = calculated.filter(r => r.returnStatus === 'OVERDUE');
    const totalFine = calculated.filter(r => r.fineStatus === 'UNPAID').reduce((sum, r) => sum + (r.fineAmount || 0), 0);

    const isRestricted = overdueBooks.length > 2 || totalFine > 100;
    const statusText = isRestricted ? 'Action Restricted' : 'Eligible';

    return {
      userId,
      issuedCount: activeIssued.length,
      overdueCount: overdueBooks.length,
      totalFine,
      status: isRestricted ? 'RESTRICTED' : 'ELIGIBLE',
      statusText,
      activeBooks: activeIssued,
      allRecords: calculated
    };
  },

  /**
   * Issues a book to a verified user
   */
  issueBook({ userId, bookName, author }, user) {
    if (user && (user.role === 'FACULTY' || user.role === 'LAB_ASSISTANT')) {
      throw new Error("Access Denied: Staff users are not authorized to perform library operations.");
    }
    if (!userId) throw new Error("User selection is required.");
    if (!bookName || !bookName.trim()) throw new Error("Book title is required.");
    if (!author || !author.trim()) throw new Error("Author name is required.");

    const today = new Date();
    const issueDateStr = today.toISOString().split('T')[0];
    
    // Default due date: 14 days from issue date
    const dueDateObj = new Date(today.setDate(today.getDate() + 14));
    const dueDateStr = dueDateObj.toISOString().split('T')[0];

    const newRecord = {
      id: "LIB-" + String(Date.now()).slice(-6),
      studentId: userId,
      userId: userId,
      bookName: bookName.trim(),
      author: author.trim(),
      issueDate: issueDateStr,
      dueDate: dueDateStr,
      returnDate: null,
      returnStatus: "ISSUED",
      fineAmount: 0,
      fineStatus: "UNPAID"
    };

    DataStore.addItem('LIBRARY_RECORDS', newRecord);

    if (window.notificationService) {
      notificationService.createNotification({
        recipientId: userId || "USR_STU_01",
        recipientRole: "STUDENT",
        title: "Library Due Reminder",
        message: "Your issued book is due soon.",
        category: "LIBRARY",
        type: "INFO",
        priority: "MEDIUM",
        relatedModule: "library"
      });

      notificationService.createNotification({
        recipientId: "USR_ADMIN_01",
        recipientRole: "ADMIN",
        title: "Library Book Issued",
        message: `Library books approaching their due date have been identified.`,
        category: "LIBRARY",
        type: "INFO",
        priority: "MEDIUM",
        relatedModule: "library"
      });
    }

    return newRecord;
  },

  /**
   * Returns an issued book
   */
  returnBook(recordId) {
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = DataStore.updateItem('LIBRARY_RECORDS', recordId, {
      returnDate: todayStr,
      returnStatus: "RETURNED",
      fineStatus: "PAID"
    });
    return updated;
  },

  calculateOverdueStatus(record) {
    const updated = { ...record };
    
    if (updated.returnStatus === 'RETURNED') {
      return updated;
    }

    const today = new Date();
    const due = new Date(updated.dueDate);
    
    const d1 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const d2 = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    
    if (d1 > d2) {
      updated.returnStatus = 'OVERDUE';
      const diffTime = Math.abs(d1 - d2);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      updated.daysOverdue = diffDays;
      updated.fineAmount = diffDays * 5; // ₹5 per day
    } else {
      updated.returnStatus = 'ISSUED';
      updated.daysOverdue = 0;
      updated.fineAmount = 0;
      
      const diffTime = d2 - d1;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 3) {
        updated.dueIndicator = 'DUE SOON';
      } else {
        updated.dueIndicator = 'ON TIME';
      }
    }
    
    return updated;
  }
};

window.LibraryService = LibraryService;

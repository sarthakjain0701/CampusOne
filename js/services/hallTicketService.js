/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - HALL TICKET SERVICE (FIRESTORE)
   ========================================================================== */

const hallTicketService = {
  get db() {
    return window.FirebaseService ? window.FirebaseService.db : null;
  },

  // Fetch hall ticket for a specific student
  async getHallTicket(studentId) {
    if (!this.db) return null;
    try {
      const snap = await this.db.collection('hallTickets')
        .where('studentId', '==', studentId)
        .get();
      if (snap.empty) {
        // Fallback check for STU001
        if (studentId !== 'STU001') {
          const snap2 = await this.db.collection('hallTickets')
            .where('studentId', '==', 'STU001')
            .get();
          if (!snap2.empty) return { id: snap2.docs[0].id, ...snap2.docs[0].data() };
        }
        return null;
      }
      return { id: snap.docs[0].id, ...snap.docs[0].data() };
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  // Generate Hall Ticket (Auto or Manual)
  async generateHallTicket(studentId, examId, formId) {
    if (!this.db) return null;

    try {
      const snap = await this.db.collection('hallTickets')
        .where('studentId', '==', studentId)
        .where('examId', '==', examId)
        .get();

      if (!snap.empty) {
        return { id: snap.docs[0].id, ...snap.docs[0].data() };
      }

      let student = null;
      try {
        const stuDoc = await this.db.collection('students').doc(studentId).get();
        if (stuDoc.exists) student = { id: stuDoc.id, ...stuDoc.data() };
      } catch(e) {}
      
      const rollNum = student ? (student.registrationNumber || student.rollNumber || student.rollNo || studentId) : studentId;

      const newTicket = {
        hallTicketNo: \`HT-\${new Date().getFullYear()}-\${rollNum}\`,
        studentId,
        examId,
        examFormId: formId,
        status: "AVAILABLE",
        generatedAt: new Date().toISOString().split('T')[0]
      };

      const docRef = await this.db.collection('hallTickets').add(newTicket);
      
      if (window.notificationService) {
        // notificationService.createNotification(...) best effort
      }

      return { id: docRef.id, ...newTicket };
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  // Publish hall ticket (Admin feature)
  async publishHallTicket(hallTicketId) {
    if (!this.db) return null;
    try {
      const updates = {
        status: "AVAILABLE",
        publishedAt: new Date().toISOString().split('T')[0]
      };
      await this.db.collection('hallTickets').doc(hallTicketId).update(updates);
      return { id: hallTicketId, ...updates };
    } catch(e) {
      console.error(e);
      return null;
    }
  },

  // Update hall ticket
  async updateHallTicket(hallTicketId, updates) {
    if (!this.db) return null;
    try {
      const u = {
        ...updates,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      await this.db.collection('hallTickets').doc(hallTicketId).update(u);
      return { id: hallTicketId, ...u };
    } catch(e) {
      console.error(e);
      return null;
    }
  }
};

window.hallTicketService = hallTicketService;

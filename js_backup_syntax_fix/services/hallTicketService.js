/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - HALL TICKET SERVICE
   ========================================================================== */

const hallTicketService = {
  // Fetch hall ticket for a specific student
  getHallTicket(studentId) {
    const hallTickets = DataStore.get('HALL_TICKETS') || [];
    const ticket = hallTickets.find(ht => ht.studentId === studentId);
    return ticket || null;
  },

  // Generate Hall Ticket (Auto or Manual)
  generateHallTicket(studentId, examId, formId) {
    const hallTickets = DataStore.get('HALL_TICKETS') || [];
    const students = DataStore.get('STUDENTS') || [];
    
    // Duplicate prevention
    const existing = hallTickets.find(ht => ht.studentId === studentId && ht.examId === examId);
    if (existing) {
      return existing;
    }

    const student = students.find(s => s.id === studentId);
    if (!student) {
      throw new Error("Student not found for Hall Ticket generation.");
    }

    const newTicket = {
      id: "HT" + String(Date.now()).slice(-6),
      hallTicketNo: `HT-${new Date().getFullYear()}-${student.registrationNumber || student.rollNumber || studentId}`,
      studentId,
      examId,
      examFormId: formId,
      status: "AVAILABLE",
      generatedAt: new Date().toISOString().split('T')[0]
    };

    hallTickets.push(newTicket);
    DataStore.set('HALL_TICKETS', hallTickets);
    
    if (window.notificationService) {
      notificationService.addNotification(
        studentId,
        "Hall Ticket Generated",
        "Your examination hall ticket has been automatically generated and is available for download.",
        "INFO"
      );
    }

    return newTicket;
  },

  // Publish hall ticket (Admin feature)
  publishHallTicket(hallTicketId) {
    const ticket = DataStore.updateItem('HALL_TICKETS', hallTicketId, {
      status: "AVAILABLE",
      publishedAt: new Date().toISOString().split('T')[0]
    });
    
    if (ticket) {
      notificationService.addNotification(
        ticket.studentId,
        "Hall Ticket Available",
        "Your examination hall ticket is now available for download.",
        "INFO"
      );
    }
    return ticket;
  },

  // Update hall ticket
  updateHallTicket(hallTicketId, updates) {
    const ticket = DataStore.updateItem('HALL_TICKETS', hallTicketId, {
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0]
    });
    
    if (ticket && ticket.status === "AVAILABLE") {
      notificationService.addNotification(
        ticket.studentId,
        "Hall Ticket Updated",
        "Your examination hall ticket has been updated.",
        "WARNING"
      );
    }
    return ticket;
  }
};

window.hallTicketService = hallTicketService;

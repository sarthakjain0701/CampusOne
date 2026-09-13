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
        // Fallback check for MOCK data if no real ticket exists
        const snapMock = await this.db.collection('hallTickets')
          .where('isMockData', '==', true)
          .limit(1)
          .get();
        if (!snapMock.empty) {
          return { id: snapMock.docs[0].id, ...snapMock.docs[0].data() };
        }
        
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
        hallTicketNo: `HT-${new Date().getFullYear()}-${rollNum}`,
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
  },

  // Seed mock data for Hall Ticket UI testing
  async seedMockHallTicketData() {
    if (!this.db) return false;
    
    try {
      const batch = this.db.batch();

      // 1. Mock Student
      const studentRef = this.db.collection('students').doc('MOCK-STU-2026-001');
      batch.set(studentRef, {
        isMockData: true,
        name: 'Rahul Sharma',
        rollNumber: 'PGC-2026-CSE-001',
        registrationNumber: 'MOCK-REG-2026-001',
        course: 'B.Tech Computer Science & Engineering',
        semester: 'VI Semester',
        academicYear: '2025-26',
        section: 'A',
        dateOfBirth: '15/08/2004',
        gender: 'Male',
        email: 'rahul.sharma.mock@example.com',
        phone: '9999999999',
        college: 'Poornima Group of College',
        campus: 'Jaipur',
        department: 'B.Tech CSE',
        // Safe mock photo placeholder (use a data URL or placeholder image, we'll let UI fallback to SVG if absent, or provide a generic avatar)
        photoUrl: 'https://ui-avatars.com/api/?name=Rahul+Sharma&background=0D8ABC&color=fff&size=128'
      });

      // 2. Mock Exam Period
      const examRef = this.db.collection('examPeriods').doc('MOCK-EXAM-2026-001');
      batch.set(examRef, {
        isMockData: true,
        name: 'End Semester Examination – May/June 2026',
        session: '2025-26',
        semester: 'VI Semester',
        academicYear: '2025-26',
        examCenter: 'Poornima Group of College, Jaipur',
        centerCode: 'MOCK-CENTER-01',
        shift: 'Morning',
        reportingTime: '08:30 AM',
        startTime: '09:00 AM',
        endTime: '12:00 PM',
        startDate: '2026-05-20'
      });

      // 3. Mock Subjects
      const subjects = [
        { id: 'MOCK-SUB-1', code: 'CS601', name: 'Data Mining', type: 'Theory', date: '20/05/2026', time: '09:00 AM – 12:00 PM', isLab: false },
        { id: 'MOCK-SUB-2', code: 'CS602', name: 'Machine Learning', type: 'Theory', date: '22/05/2026', time: '09:00 AM – 12:00 PM', isLab: false },
        { id: 'MOCK-SUB-3', code: 'CS603', name: 'Compiler Design', type: 'Theory', date: '25/05/2026', time: '09:00 AM – 12:00 PM', isLab: false },
        { id: 'MOCK-SUB-4', code: 'CS604', name: 'Computer Networks', type: 'Theory', date: '27/05/2026', time: '09:00 AM – 12:00 PM', isLab: false },
        { id: 'MOCK-SUB-5', code: 'CS605', name: 'Software Engineering', type: 'Theory', date: '29/05/2026', time: '09:00 AM – 12:00 PM', isLab: false },
        { id: 'MOCK-SUB-6', code: 'CS651', name: 'Machine Learning Lab', type: 'Practical', date: '02/06/2026', time: '09:00 AM – 12:00 PM', isLab: true },
        { id: 'MOCK-SUB-7', code: 'CS652', name: 'Computer Networks Lab', type: 'Practical', date: '04/06/2026', time: '09:00 AM – 12:00 PM', isLab: true }
      ];

      const subjectIds = [];
      subjects.forEach(sub => {
        const subRef = this.db.collection('subjects').doc(sub.id);
        batch.set(subRef, { ...sub, isMockData: true });
        subjectIds.push(sub.id);
      });

      // 4. Mock Exam Form
      const formRef = this.db.collection('examForms').doc('MOCK-FORM-2026-001');
      batch.set(formRef, {
        isMockData: true,
        studentId: 'MOCK-STU-2026-001',
        examId: 'MOCK-EXAM-2026-001',
        selectedSubjectIds: subjectIds,
        status: 'APPROVED'
      });

      // 5. Mock Hall Ticket
      const htRef = this.db.collection('hallTickets').doc('MOCK-HT-2026-001');
      batch.set(htRef, {
        isMockData: true,
        hallTicketNo: 'HT-2026-MOCK-001',
        studentId: 'MOCK-STU-2026-001',
        examId: 'MOCK-EXAM-2026-001',
        examFormId: 'MOCK-FORM-2026-001',
        status: 'AVAILABLE'
      });

      await batch.commit();
      console.log('Mock Hall Ticket Data successfully seeded!');
      return true;
    } catch (e) {
      console.error('Error seeding mock hall ticket data:', e);
      return false;
    }
  }
};

window.hallTicketService = hallTicketService;

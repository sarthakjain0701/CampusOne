/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - EXAM FORM SERVICE (FIRESTORE)
   ========================================================================== */

const ExamFormService = {
  get db() {
    return window.FirebaseService ? window.FirebaseService.db : null;
  },

  async getExamPeriods() {
    if (!this.db) return [];
    try {
      const snap = await this.db.collection('examPeriods').get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async getOpenExamPeriods() {
    const periods = await this.getExamPeriods();
    return periods.filter(p => p.status === 'OPEN' || p.status === 'UPCOMING');
  },

  async getAllSubmissions() {
    if (!this.db) return [];
    try {
      const snap = await this.db.collection('examForms').get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async getStudentExamForms(studentId) {
    if (!this.db) return [];
    try {
      const snap = await this.db.collection('examForms')
        .where('studentId', 'in', [studentId, 'STU001'])
        .get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async getExamFormById(id) {
    if (!this.db) return null;
    try {
      const doc = await this.db.collection('examForms').doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  async checkStudentEligibility(studentId, examId) {
    const submissions = await this.getStudentExamForms(studentId);
    const existing = submissions.find(s => s.examId === examId && s.status !== 'REJECTED' && s.status !== 'NOT_SUBMITTED');
    return !existing;
  },

  async createExamForm(data) {
    if (!Validation.isRequired(data.studentId)) throw new Error("Student ID is required.");
    if (!Validation.isRequired(data.examId)) throw new Error("Exam selection is required.");
    if (!data.selectedSubjectIds || data.selectedSubjectIds.length === 0) {
      throw new Error("At least one eligible subject must be selected.");
    }

    const periods = await this.getExamPeriods();
    const examPeriod = periods.find(p => p.id === data.examId);
    if (!examPeriod) throw new Error("Exam period not found.");

    const submissions = await this.getAllSubmissions();
    const count = submissions.length + 1;
    const year = new Date().getFullYear();
    const appNum = \`EXF-\${year}-\${String(count).padStart(4, '0')}\`;

    const newForm = {
      applicationNumber: appNum,
      studentId: data.studentId,
      examId: data.examId,
      semester: Number(examPeriod.semester),
      academicYear: examPeriod.academicYear,
      selectedSubjectIds: data.selectedSubjectIds,
      status: 'NOT_SUBMITTED',
      submittedAt: null,
      reviewedAt: null,
      reviewedBy: null,
      adminComment: null,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    const docRef = await this.db.collection('examForms').add(newForm);
    return { id: docRef.id, ...newForm };
  },

  async submitExamForm(id, frontendPayload = null) {
    const form = await this.getExamFormById(id);
    if (!form) throw new Error("Examination form not found.");
    if (form.status !== 'NOT_SUBMITTED') throw new Error("Form is already submitted or reviewed.");

    let isAutoApproved = false;
    let manualReviewReason = null;
    let newStatus = 'SUBMITTED';

    let student = null;
    try {
      const stuDoc = await this.db.collection('students').doc(form.studentId).get();
      if (stuDoc.exists) student = { id: stuDoc.id, ...stuDoc.data() };
    } catch(e) {}

    if (!student) {
      newStatus = 'MANUAL_REVIEW_REQUIRED';
      manualReviewReason = "Student record not found in database.";
    } else if (frontendPayload) {
      const dbReg = (student.registrationNumber || student.rollNo || student.rollNumber || '').toLowerCase().trim();
      const payloadReg = (frontendPayload.registrationNumber || '').toLowerCase().trim();
      const dbName = (student.name || '').toLowerCase().trim();
      const payloadName = (frontendPayload.name || '').toLowerCase().trim();

      if (payloadReg && payloadReg !== dbReg) {
        newStatus = 'MANUAL_REVIEW_REQUIRED';
        manualReviewReason = "Registration number mismatch.";
      } else if (payloadName && payloadName !== dbName) {
        newStatus = 'MANUAL_REVIEW_REQUIRED';
        manualReviewReason = "Student identity mismatch.";
      } else {
        isAutoApproved = true;
      }
    } else {
      isAutoApproved = true;
    }

    if (isAutoApproved) {
      newStatus = 'APPROVED';
    }

    const updates = {
      status: newStatus,
      isAutoApproved: isAutoApproved,
      adminComment: manualReviewReason || (isAutoApproved ? "Auto Approved. Hall Ticket Generated." : null),
      submittedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    await this.db.collection('examForms').doc(id).update(updates);

    if (isAutoApproved && window.hallTicketService) {
      await hallTicketService.generateHallTicket(form.studentId, form.examId, id);
    }

    if (window.notificationService) {
      // Best effort notification
    }

    return { id, ...form, ...updates };
  },

  async approveExamForm(id, reviewerId = "USR_ADMIN_01") {
    const form = await this.getExamFormById(id);
    if (!form) throw new Error("Form not found.");

    const updates = {
      status: 'APPROVED',
      isAutoApproved: false,
      reviewedAt: new Date().toISOString().split('T')[0],
      reviewedBy: reviewerId,
      adminComment: "Approved manually. Hall ticket generated.",
      updatedAt: new Date().toISOString().split('T')[0]
    };

    await this.db.collection('examForms').doc(id).update(updates);

    if (window.hallTicketService) {
      await hallTicketService.generateHallTicket(form.studentId, form.examId, id);
    }

    return { id, ...form, ...updates };
  },

  async rejectExamForm(id, comment, reviewerId = "USR_ADMIN_01") {
    if (!comment || comment.trim() === '') {
      throw new Error("Rejection reason / admin remark is mandatory.");
    }
    const form = await this.getExamFormById(id);
    if (!form) throw new Error("Form not found.");

    const updates = {
      status: 'REJECTED',
      reviewedAt: new Date().toISOString().split('T')[0],
      reviewedBy: reviewerId,
      adminComment: comment.trim(),
      updatedAt: new Date().toISOString().split('T')[0]
    };

    await this.db.collection('examForms').doc(id).update(updates);
    return { id, ...form, ...updates };
  },

  async searchExamForms({ examId, semester, status, departmentId, query }) {
    let list = await this.getAllSubmissions();
    
    // Fallback if no db
    if (!this.db) return list;

    let students = [];
    try {
      const sSnap = await this.db.collection('students').get();
      students = sSnap.docs.map(d => ({id: d.id, ...d.data()}));
    } catch(e) {}

    if (examId && examId !== 'ALL') {
      list = list.filter(f => f.examId === examId);
    }
    if (semester && semester !== 'ALL') {
      list = list.filter(f => Number(f.semester) === Number(semester));
    }
    if (status && status !== 'ALL') {
      list = list.filter(f => f.status === status);
    }
    if (departmentId && departmentId !== 'ALL') {
      list = list.filter(f => {
        const student = students.find(s => s.id === f.studentId);
        return student && (student.departmentId === departmentId || student.department === departmentId);
      });
    }

    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      list = list.filter(f => {
        const student = students.find(s => s.id === f.studentId);
        const nameMatch = student && student.name && student.name.toLowerCase().includes(q);
        const roll = student ? (student.rollNo || student.rollNumber || '') : '';
        const rollMatch = roll.toLowerCase().includes(q);
        const appMatch = (f.applicationNumber || '').toLowerCase().includes(q);
        return nameMatch || rollMatch || appMatch;
      });
    }

    return list;
  },

  async createExamPeriod(data) {
    if (!Validation.isRequired(data.name)) throw new Error("Exam Name is required.");
    if (!Validation.isRequired(data.startDate)) throw new Error("Start Date is required.");
    if (!Validation.isRequired(data.endDate)) throw new Error("End Date is required.");

    const newPeriod = {
      name: data.name.trim(),
      academicYear: data.academicYear || "2026-27",
      semester: Number(data.semester || 2),
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status || 'OPEN',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    const docRef = await this.db.collection('examPeriods').add(newPeriod);
    return { id: docRef.id, ...newPeriod };
  },

  async closeExamPeriod(id) {
    await this.db.collection('examPeriods').doc(id).update({
      status: 'CLOSED',
      updatedAt: new Date().toISOString().split('T')[0]
    });
  }
};

window.ExamFormService = ExamFormService;

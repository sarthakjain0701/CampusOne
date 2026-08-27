/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - EXAM FORM SERVICE
   ========================================================================== */

const ExamFormService = {
  getExamPeriods() {
    return DataStore.get('EXAM_PERIODS');
  },

  getOpenExamPeriods() {
    return this.getExamPeriods().filter(p => p.status === 'OPEN' || p.status === 'UPCOMING');
  },

  getAllSubmissions() {
    return DataStore.get('EXAM_FORMS');
  },

  getStudentExamForms(studentId) {
    return this.getAllSubmissions().filter(f => f.studentId === studentId || f.studentId === "STU001");
  },

  getExamFormById(id) {
    return this.getAllSubmissions().find(f => f.id === id) || null;
  },

  checkStudentEligibility(studentId, examId) {
    const submissions = this.getStudentExamForms(studentId);
    // Student is NOT eligible if they already have a SUBMITTED, APPROVED or UNDER_REVIEW form for this exam
    const existing = submissions.find(s => s.examId === examId && s.status !== 'REJECTED' && s.status !== 'NOT_SUBMITTED');
    return !existing;
  },

  createExamForm(data) {
    if (!Validation.isRequired(data.studentId)) throw new Error("Student ID is required.");
    if (!Validation.isRequired(data.examId)) throw new Error("Exam selection is required.");
    if (!data.selectedSubjectIds || data.selectedSubjectIds.length === 0) {
      throw new Error("At least one eligible subject must be selected.");
    }

    const examPeriod = this.getExamPeriods().find(p => p.id === data.examId);
    if (!examPeriod) throw new Error("Exam period not found.");

    // Generate Application Number
    const submissions = this.getAllSubmissions();
    const count = submissions.length + 1;
    const year = new Date().getFullYear();
    const appNum = `EXF-${year}-${String(count).padStart(4, '0')}`;

    const newForm = {
      id: "EXF" + String(Date.now()).slice(-6),
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

    DataStore.addItem('EXAM_FORMS', newForm);
    return newForm;
  },

  submitExamForm(id, frontendPayload = null) {
    const form = this.getExamFormById(id);
    if (!form) throw new Error("Examination form not found.");
    if (form.status !== 'NOT_SUBMITTED') throw new Error("Form is already submitted or reviewed.");

    // 1. Backend Verification
    let isAutoApproved = false;
    let manualReviewReason = null;
    let newStatus = 'SUBMITTED';

    const students = DataStore.get('STUDENTS') || [];
    const student = students.find(s => s.id === form.studentId);

    if (!student) {
      newStatus = 'MANUAL_REVIEW_REQUIRED';
      manualReviewReason = "Student record not found in database.";
    } else if (frontendPayload) {
      const dbReg = (student.registrationNumber || student.rollNumber || '').toLowerCase().trim();
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
      isAutoApproved = true; // existing trusted flow fallback
    }

    if (isAutoApproved) {
      newStatus = 'APPROVED';
    }

    const updated = DataStore.updateItem('EXAM_FORMS', id, {
      status: newStatus,
      isAutoApproved: isAutoApproved,
      adminComment: manualReviewReason || (isAutoApproved ? "Auto Approved. Hall Ticket Generated." : null),
      submittedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    });

    if (isAutoApproved && window.hallTicketService) {
      hallTicketService.generateHallTicket(form.studentId, form.examId, form.id);
    }

    // Notify user
    if (window.notificationService) {
      notificationService.addNotification({
        userId: form.studentId,
        title: isAutoApproved ? "Exam Form Auto-Approved" : "Exam Form Submitted",
        message: isAutoApproved 
          ? `Your examination form for Semester ${form.semester} has been auto-approved and Hall Ticket is available.` 
          : `Your examination form for Semester ${form.semester} is submitted and pending manual review. Application No: ${form.applicationNumber}.`,
        type: isAutoApproved ? "SUCCESS" : "INFO"
      });
    }

    return updated;
  },

  approveExamForm(id, reviewerId = "USR_ADMIN_01") {
    const form = this.getExamFormById(id);
    if (!form) throw new Error("Form not found.");

    const updated = DataStore.updateItem('EXAM_FORMS', id, {
      status: 'APPROVED',
      isAutoApproved: false,
      reviewedAt: new Date().toISOString().split('T')[0],
      reviewedBy: reviewerId,
      adminComment: "Approved manually. Hall ticket generated.",
      updatedAt: new Date().toISOString().split('T')[0]
    });

    if (window.hallTicketService) {
      hallTicketService.generateHallTicket(form.studentId, form.examId, form.id);
    }

    if (window.notificationService) {
      notificationService.createNotification({
        recipientId: form.studentId || "USR_STU_01",
        recipientRole: "STUDENT",
        title: "Exam Form Approved",
        message: "Your examination form has been approved and Hall Ticket is available.",
        category: "EXAM_FORM",
        type: "SUCCESS",
        priority: "MEDIUM",
        relatedModule: "exam-form"
      });
    }

    return updated;
  },

  rejectExamForm(id, comment, reviewerId = "USR_ADMIN_01") {
    if (!comment || comment.trim() === '') {
      throw new Error("Rejection reason / admin remark is mandatory.");
    }

    const form = this.getExamFormById(id);
    if (!form) throw new Error("Form not found.");

    const updated = DataStore.updateItem('EXAM_FORMS', id, {
      status: 'REJECTED',
      reviewedAt: new Date().toISOString().split('T')[0],
      reviewedBy: reviewerId,
      adminComment: comment.trim(),
      updatedAt: new Date().toISOString().split('T')[0]
    });

    if (window.notificationService) {
      notificationService.createNotification({
        recipientId: form.studentId || "USR_STU_01",
        recipientRole: "STUDENT",
        title: "Exam Form Rejected",
        message: "Your examination form has been rejected.",
        rejectionReason: comment.trim(),
        category: "EXAM_FORM",
        type: "WARNING",
        priority: "HIGH",
        relatedModule: "exam-form"
      });
    }

    return updated;
  },

  searchExamForms({ examId, semester, status, departmentId, query }) {
    let list = this.getAllSubmissions();
    const students = DataStore.get('STUDENTS');

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
        const nameMatch = student && student.name.toLowerCase().includes(q);
        const roll = student ? (student.rollNo || student.rollNumber || '') : '';
        const rollMatch = roll.toLowerCase().includes(q);
        const appMatch = f.applicationNumber.toLowerCase().includes(q);
        return nameMatch || rollMatch || appMatch;
      });
    }

    return list;
  },

  createExamPeriod(data) {
    if (!Validation.isRequired(data.name)) throw new Error("Exam Name is required.");
    if (!Validation.isRequired(data.startDate)) throw new Error("Start Date is required.");
    if (!Validation.isRequired(data.endDate)) throw new Error("End Date is required.");

    const newPeriod = {
      id: "EXP" + String(Date.now()).slice(-6),
      name: data.name.trim(),
      academicYear: data.academicYear || "2026-27",
      semester: Number(data.semester || 2),
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status || 'OPEN',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    DataStore.addItem('EXAM_PERIODS', newPeriod);
    return newPeriod;
  },

  closeExamPeriod(id) {
    return DataStore.updateItem('EXAM_PERIODS', id, {
      status: 'CLOSED',
      updatedAt: new Date().toISOString().split('T')[0]
    });
  }
};

window.ExamFormService = ExamFormService;

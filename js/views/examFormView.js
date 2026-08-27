/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - EXAM FORM VIEW CONTROLLER
   ========================================================================== */

const ExamFormView = {
  viewMode: 'dashboard', // 'dashboard' | 'fill' | 'review' | 'success' | 'view_form'
  selectedExamPeriodId: null,
  selectedSubjectIds: [],
  reviewFormData: null,
  viewingSubmissionId: null,
  declarationAgreed: false,

  render(params = {}) {
    const user = authService.getCurrentUser();
    if (!user) return `<div>Please log in.</div>`;

    const students = DataStore.get('STUDENTS');
    const student = students.find(s => s.email === user.email || s.userId === user.uid) || students[0];

    if (!student) {
      return `<div class="card" style="padding:2rem; text-align:center; color:var(--color-danger);">Student profile not found.</div>`;
    }

    if (this.viewMode === 'fill') {
      return this.renderFillForm(student);
    } else if (this.viewMode === 'review') {
      return this.renderReviewForm(student);
    } else if (this.viewMode === 'success') {
      return this.renderSuccessForm(student);
    } else if (this.viewMode === 'view_form') {
      return this.renderViewFormDetails(student);
    } else {
      return this.renderDashboard(student);
    }
  },

  // --------------------------------------------------------------------------
  // DASHBOARD VIEW (ACTIVE EXAMS & SUBMISSION HISTORY)
  // --------------------------------------------------------------------------
  renderDashboard(student) {
    const examPeriods = ExamFormService.getExamPeriods();
    const activePeriods = examPeriods.filter(p => p.status === 'OPEN' || p.status === 'UPCOMING');
    const submissions = ExamFormService.getStudentExamForms(student.id);

    return `
      <div class="page-header">
        <h1>EXAMINATION FORMS</h1>
        <p>Apply for end-semester examinations and view submission history.</p>
      </div>

      <!-- ACTIVE EXAM PERIODS -->
      <div class="card" style="margin-bottom: 2rem;">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="file-signature"></i> Active Exam Registrations</h3>
        </div>

        ${activePeriods.length === 0 ? `
          <div style="padding: 2rem; text-align: center; color: var(--color-text-muted);">
            No active exam registration periods at this time.
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; padding: 1rem 0;">
            ${activePeriods.map(p => {
              const eligible = ExamFormService.checkStudentEligibility(student.id, p.id);
              const submittedForm = submissions.find(s => s.examId === p.id);
              
              let actionBtnHtml = '';
              let statusLabelHtml = '';

              if (submittedForm) {
                let badgeClass = 'warning';
                if (submittedForm.status === 'APPROVED') badgeClass = 'present';
                if (submittedForm.status === 'REJECTED') badgeClass = 'danger';
                if (submittedForm.status === 'SUBMITTED') badgeClass = 'active';

                statusLabelHtml = `<span class="status-badge ${badgeClass}" style="font-size:0.75rem;">${submittedForm.status}</span>`;
                actionBtnHtml = `
                  <button class="btn-secondary" style="width:100%; justify-content:center;" onclick="ExamFormView.viewSubmittedForm('${submittedForm.id}')">
                    <i data-lucide="eye"></i> View Submitted Form
                  </button>
                `;
              } else if (p.status === 'OPEN' && eligible) {
                statusLabelHtml = `<span class="status-badge present" style="font-size:0.75rem;">OPEN</span>`;
                actionBtnHtml = `
                  <button class="btn-primary" style="width:100%; justify-content:center;" onclick="ExamFormView.startApplication('${p.id}')">
                    <i data-lucide="edit"></i> Apply Now
                  </button>
                `;
              } else if (p.status === 'UPCOMING') {
                statusLabelHtml = `<span class="status-badge warning" style="font-size:0.75rem;">UPCOMING</span>`;
                actionBtnHtml = `
                  <button class="btn-secondary" style="width:100%; justify-content:center;" disabled>
                    Not Started Yet
                  </button>
                `;
              } else {
                statusLabelHtml = `<span class="status-badge danger" style="font-size:0.75rem;">CLOSED</span>`;
                actionBtnHtml = `
                  <button class="btn-secondary" style="width:100%; justify-content:center;" disabled>
                    Application Closed / Complete
                  </button>
                `;
              }

              return `
                <div class="card" style="border: 1px solid var(--color-border); background: #FAF9F6; margin-bottom: 0;">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 1rem;">
                    <h4 style="font-size: 1.15rem; font-weight:800; color: var(--color-navy-dark); margin:0;">${p.name}</h4>
                    ${statusLabelHtml}
                  </div>
                  <div style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 1.25rem; line-height:1.6;">
                    <div>Semester: <strong>Semester ${p.semester}</strong></div>
                    <div>Academic Year: <strong>${p.academicYear}</strong></div>
                    <div>Submission Deadline: <strong style="color: var(--color-danger);">${this.formatDateDisplay(p.endDate)}</strong></div>
                  </div>
                  ${actionBtnHtml}
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- EXAM FORM HISTORY -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="history"></i> Application History</h3>
        </div>

        ${submissions.length === 0 ? `
          <div style="padding: 2rem; text-align: center; color: var(--color-text-muted);">
            No previous examination applications submitted.
          </div>
        ` : `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Application No.</th>
                  <th>Exam Name</th>
                  <th>Semester</th>
                  <th>Submission Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${submissions.map(s => {
                  const p = examPeriods.find(ep => ep.id === s.examId);
                  let statusClass = 'warning';
                  if (s.status === 'APPROVED') statusClass = 'present';
                  if (s.status === 'REJECTED') statusClass = 'danger';
                  if (s.status === 'SUBMITTED') statusClass = 'active';

                  return `
                    <tr>
                      <td><strong>${s.applicationNumber}</strong></td>
                      <td>${p ? p.name : 'Semester Exam'}</td>
                      <td>Semester ${s.semester}</td>
                      <td>${s.submittedAt ? this.formatDateDisplay(s.submittedAt) : '—'}</td>
                      <td><span class="status-badge ${statusClass}">${s.status}</span></td>
                      <td>
                        <button class="btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="ExamFormView.viewSubmittedForm('${s.id}')">
                          <i data-lucide="eye" style="width:14px; height:14px;"></i> View
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  },

  // --------------------------------------------------------------------------
  // FILL EXAM FORM VIEW
  // --------------------------------------------------------------------------
  renderFillForm(student) {
    const examPeriod = ExamFormService.getExamPeriods().find(p => p.id === this.selectedExamPeriodId);
    const allSubjects = subjectService.getSubjects();
    
    // Eligible subjects for student's current semester
    const eligibleSubjects = allSubjects.filter(sub => sub.semester === Number(examPeriod.semester));

    return `
      <div class="page-header">
        <button class="btn-secondary" onclick="ExamFormView.backToDashboard()" style="margin-bottom:0.5rem; padding:0.35rem 0.75rem; font-size:0.85rem;">
          <i data-lucide="arrow-left"></i> Cancel
        </button>
        <h1>Fill Examination Form</h1>
        <p>Exam: <strong>${examPeriod.name}</strong> | Academic Year: <strong>${examPeriod.academicYear}</strong></p>
      </div>

      <!-- READ-ONLY OFFICIAL STUDENT IDENTITY INFORMATION -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header" style="border-bottom: 1px solid #F1F5F9; padding-bottom: 0.75rem;">
          <h3 class="card-title"><i data-lucide="user-check"></i> Student Details (Read-only)</h3>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; padding-top: 1rem; font-size: 0.9rem; line-height: 1.6;">
          <div>
            <div>Student Name: <strong style="color: var(--color-navy-dark);">${student.name}</strong></div>
            <div>Roll Number: <strong style="color: var(--color-navy-dark);">${student.rollNumber || student.rollNo || 'N/A'}</strong></div>
            <div>Registration Number: <strong style="color: var(--color-navy-dark);">${student.registrationNumber || 'N/A'}</strong></div>
          </div>
          <div>
            <div>Course: <strong style="color: var(--color-navy-dark);">B.Tech</strong></div>
            <div>Branch: <strong style="color: var(--color-navy-dark);">${student.department || 'Computer Science'}</strong></div>
            <div>Semester: <strong style="color: var(--color-navy-dark);">Semester ${examPeriod.semester}</strong></div>
          </div>
        </div>
      </div>

      <!-- ELIGIBLE SUBJECTS SELECTOR -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header" style="border-bottom: 1px solid #F1F5F9; padding-bottom: 0.75rem;">
          <h3 class="card-title"><i data-lucide="book-open"></i> Select Examination Subjects</h3>
          <span class="card-subtitle">Choose the subjects you are applying to write.</span>
        </div>
        
        <div style="padding-top: 1rem;">
          ${eligibleSubjects.length === 0 ? `
            <div style="color:var(--color-danger); font-weight:500;">No eligible subjects configured for Semester ${examPeriod.semester}.</div>
          ` : `
            <div class="subject-selection-list" style="display:grid; gap: 0.75rem;">
              ${eligibleSubjects.map(sub => {
                const checked = this.selectedSubjectIds.includes(sub.id) ? 'checked' : '';
                return `
                  <label class="checkbox-container" style="display:flex; align-items:center; gap: 10px; cursor:pointer; font-weight:500; font-size:0.95rem;">
                    <input type="checkbox" style="width:18px; height:18px; cursor:pointer;" value="${sub.id}" ${checked} onchange="ExamFormView.toggleSubjectSelection(this)">
                    <span>${sub.name} (${sub.code}) - ${sub.credits} Credits</span>
                  </label>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>

      <div style="display:flex; gap:1rem; justify-content:flex-end;">
        <button class="btn-secondary" onclick="ExamFormView.backToDashboard()">Cancel</button>
        <button class="btn-primary" onclick="ExamFormView.proceedToReview()">Proceed to Review <i data-lucide="arrow-right"></i></button>
      </div>
    `;
  },

  // --------------------------------------------------------------------------
  // REVIEW FORM VIEW
  // --------------------------------------------------------------------------
  renderReviewForm(student) {
    const examPeriod = ExamFormService.getExamPeriods().find(p => p.id === this.selectedExamPeriodId);
    const subjects = subjectService.getSubjects();
    const selectedSubjects = subjects.filter(s => this.selectedSubjectIds.includes(s.id));

    return `
      <div class="page-header">
        <button class="btn-secondary" onclick="ExamFormView.backToFill()" style="margin-bottom:0.5rem; padding:0.35rem 0.75rem; font-size:0.85rem;">
          <i data-lucide="arrow-left"></i> Back to Edit
        </button>
        <h1>Review Examination Form</h1>
        <p>Review details carefully before final submission. Exam forms cannot be edited after submission.</p>
      </div>

      <!-- REVIEW DETAILS -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header" style="border-bottom:1px solid #F1F5F9; padding-bottom: 0.75rem;">
          <h3 class="card-title"><i data-lucide="file-check"></i> Application Summary</h3>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap:1rem; padding:1rem 0; font-size:0.9rem; line-height:1.6; border-bottom:1px dashed #E2E8F0;">
          <div>
            <div><strong>Student Name:</strong> ${student.name}</div>
            <div><strong>Roll Number:</strong> ${student.rollNumber || student.rollNo || 'N/A'}</div>
            <div><strong>Registration Number:</strong> ${student.registrationNumber || 'N/A'}</div>
            <div><strong>Exam Name:</strong> ${examPeriod.name}</div>
          </div>
          <div>
            <div><strong>Semester:</strong> Semester ${examPeriod.semester}</div>
            <div><strong>Academic Year:</strong> ${examPeriod.academicYear}</div>
            <div><strong>Deadline:</strong> ${this.formatDateDisplay(examPeriod.endDate)}</div>
          </div>
        </div>

        <div style="padding-top:1rem;">
          <h4 style="margin-bottom:0.5rem; color:var(--color-navy-dark);">Selected Subjects:</h4>
          <ul style="padding-left:1.25rem; font-size:0.9rem; line-height:1.6;">
            ${selectedSubjects.map(s => `<li><strong>${s.name}</strong> (${s.code})</li>`).join('')}
          </ul>
        </div>
      </div>

      <!-- DECLARATION CHECKBOX -->
      <div class="card" style="margin-bottom: 1.5rem; border:1px solid var(--color-warning-border); background:var(--color-warning-bg);">
        <h4 style="color:var(--color-warning); font-size:1rem; margin-bottom:0.5rem;"><i data-lucide="alert-triangle"></i> Student Declaration</h4>
        <p style="font-size:0.875rem; color:#92400E; margin-bottom:1rem; line-height:1.5;">
          "I confirm that the information provided in this examination form is correct and I am eligible to sit for the registered subjects."
        </p>
        <label style="display:flex; align-items:center; gap: 8px; cursor:pointer; font-weight:600; font-size:0.9rem; color:#92400E;">
          <input type="checkbox" id="declaration-check" style="width:18px; height:18px;" ${this.declarationAgreed ? 'checked' : ''} onchange="ExamFormView.toggleDeclaration(this.checked)">
          <span>I Agree and Declare</span>
        </label>
      </div>

      <div style="display:flex; gap:1rem; justify-content:flex-end;">
        <button class="btn-secondary" onclick="ExamFormView.backToFill()"><i data-lucide="edit"></i> Back</button>
        <button class="btn-primary" onclick="ExamFormView.submitFormPrompt()">Submit Form <i data-lucide="check"></i></button>
      </div>
    `;
  },  // --------------------------------------------------------------------------
  // SUCCESS / RESULT STATE
  // --------------------------------------------------------------------------
  renderSuccessState(student) {
    const sub = this.reviewFormData;
    
    const isApproved = sub && sub.status === 'APPROVED';
    const isManualReview = sub && sub.status === 'MANUAL_REVIEW_REQUIRED';
    
    const title = isApproved ? "EXAM FORM APPROVED" : "EXAM FORM SUBMITTED SUCCESSFULLY";
    const subtitle = isApproved 
      ? "Your examination form has been verified and automatically approved." 
      : (isManualReview ? "Your form is currently under administrative review. Hall Ticket will be available after approval." : "Your application has been received and is currently under review by college administration.");
    
    const icon = isApproved ? 'check-circle' : 'clock';
    const iconColor = isApproved ? '#16A34A' : '#EAB308';

    return `
      <div class="card" style="max-width:600px; margin:2rem auto; text-align:center; padding:3rem 2rem;">
        <div style="width:64px; height:64px; border-radius:50%; background:${isApproved ? '#DCFCE7' : '#FEF3C7'}; color:${iconColor}; display:flex; align-items:center; justify-content:center; margin:0 auto 1.5rem auto;">
          <i data-lucide="${icon}" style="width:36px; height:36px;"></i>
        </div>
        <h2 style="color:var(--color-navy-dark); font-weight:800; margin-bottom:0.5rem;">${title}</h2>
        <p style="color:var(--color-text-muted); font-size:0.95rem; margin-bottom:1.5rem;">
          ${subtitle}
        </p>

        <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:1.25rem; text-align:left; font-size:0.9rem; line-height:1.6; margin-bottom:2rem;">
          <div>Application Number: <strong style="color:#2563EB;">${sub ? sub.applicationNumber : 'EXF-2026-0001'}</strong></div>
          <div>Status: <strong style="color:${isApproved ? '#16A34A' : (isManualReview ? '#EAB308' : '#2563EB')};">${sub ? (sub.isAutoApproved ? 'Approved ✓' : sub.status) : 'SUBMITTED'}</strong></div>
          <div>Submission Date: <strong>${sub ? this.formatDateDisplay(sub.submittedAt) : 'Today'}</strong></div>
          ${isApproved ? `<div style="margin-top:0.5rem; padding-top:0.5rem; border-top:1px solid #E2E8F0;">Hall Ticket: <strong style="color:#16A34A;">Available ✓</strong></div>` : ''}
        </div>

        <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap;">
          <button class="btn-secondary" onclick="ExamFormView.backToDashboard()">Return to Portal</button>
          <button class="btn-primary" onclick="ExamFormView.viewSubmittedForm('${sub ? sub.id : ''}')">View Application</button>
          ${isApproved ? `<button class="btn-secondary" style="color:var(--color-primary); border-color:var(--color-primary);" onclick="App.navigate('hall-ticket')"><i data-lucide="file-text" style="width:16px; height:16px; display:inline; margin-right:4px;"></i> View Hall Ticket</button>` : ''}
        </div>
      </div>
    `;
  },

  // --------------------------------------------------------------------------
  // VIEW SUBMITTED FORM DETAILS (READ-ONLY VIEW)
  // --------------------------------------------------------------------------
  renderViewFormDetails(student) {
    const submission = ExamFormService.getExamFormById(this.viewingSubmissionId);
    if (!submission) return `<div class="card">Application not found.</div>`;

    const examPeriod = ExamFormService.getExamPeriods().find(p => p.id === submission.examId);
    const subjects = subjectService.getSubjects();
    const selectedSubjects = subjects.filter(s => submission.selectedSubjectIds.includes(s.id));

    let badgeClass = 'warning';
    if (submission.status === 'APPROVED') badgeClass = 'present';
    if (submission.status === 'REJECTED') badgeClass = 'danger';
    if (submission.status === 'SUBMITTED') badgeClass = 'active';
    if (submission.status === 'MANUAL_REVIEW_REQUIRED') badgeClass = 'warning';
    
    const displayStatus = (submission.status === 'APPROVED' && submission.isAutoApproved) ? 'Auto Approved ✓' : (submission.status === 'APPROVED' ? 'Approved' : submission.status);

    return `
      <div class="page-header">
        <button class="btn-secondary" onclick="ExamFormView.backToDashboard()" style="margin-bottom:0.5rem; padding:0.35rem 0.75rem; font-size:0.85rem;">
          <i data-lucide="arrow-left"></i> Back to Dashboard
        </button>
        <h1>Application Details — ${submission.applicationNumber}</h1>
        <div style="display:flex; align-items:center; gap:1rem;">
          <p style="margin:0;">Status: <span class="status-badge ${badgeClass}" style="font-weight:700;">${displayStatus}</span></p>
          ${submission.status === 'APPROVED' ? `
            <button class="btn-primary btn-sm" onclick="App.navigate('hall-ticket')">
              <i data-lucide="download" style="width:14px; height:14px; display:inline;"></i> Download Hall Ticket
            </button>
          ` : ''}
        </div>
      </div>

      <!-- DETAIL CARD -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-header" style="border-bottom:1px solid #F1F5F9; padding-bottom: 0.75rem;">
          <h3 class="card-title"><i data-lucide="file-text"></i> Submitted Form Details</h3>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem; padding:1.25rem 0; font-size:0.925rem; line-height:1.7; border-bottom:1px dashed #E2E8F0;">
          <div>
            <div>Student: <strong>${student.name}</strong></div>
            <div>Roll Number: <strong>${student.rollNumber || student.rollNo || 'N/A'}</strong></div>
            <div>Registration No: <strong>${student.registrationNumber || 'N/A'}</strong></div>
            <div>Exam Period: <strong>${examPeriod ? examPeriod.name : 'End Sem Exam'}</strong></div>
          </div>
          <div>
            <div>Semester: <strong>Semester ${submission.semester}</strong></div>
            <div>Academic Year: <strong>${submission.academicYear}</strong></div>
            <div>Submission Date: <strong>${this.formatDateDisplay(submission.submittedAt)}</strong></div>
          </div>
        </div>

        <!-- SUBJECTS LIST -->
        <div style="padding-top:1.25rem;">
          <h4 style="margin-bottom:0.5rem; color:var(--color-navy-dark);">Selected Examination Subjects:</h4>
          <ul style="padding-left:1.5rem; font-size:0.9rem; line-height:1.6;">
            ${selectedSubjects.map(s => `<li><strong>${s.name}</strong> (${s.code}) - ${s.credits} Credits</li>`).join('')}
          </ul>
        </div>
      </div>

      <!-- ADMIN FEEDBACK / REMARKS -->
      ${submission.adminComment ? `
        <div class="card" style="border-left: 4px solid ${submission.status === 'APPROVED' ? 'var(--color-success)' : 'var(--color-danger)'}; background:#F8FAFC;">
          <h4 style="color:var(--color-navy-dark); font-size:0.95rem; margin-bottom:0.25rem;">Administrator Remarks:</h4>
          <p style="font-size:0.9rem; color:var(--color-text-muted); font-style:italic;">"${submission.adminComment}"</p>
        </div>
      ` : ''}
    `;
  },

  // --------------------------------------------------------------------------
  // CONTROLLER LOGIC METHODS
  // --------------------------------------------------------------------------
  startApplication(examId) {
    const examPeriod = ExamFormService.getExamPeriods().find(p => p.id === examId);
    this.selectedExamPeriodId = examId;
    this.selectedSubjectIds = [];
    this.declarationAgreed = false;
    
    // Auto-check/select eligible subjects by default to make form filling quick
    const allSubjects = subjectService.getSubjects();
    const eligible = allSubjects.filter(sub => sub.semester === Number(examPeriod.semester));
    this.selectedSubjectIds = eligible.map(sub => sub.id);

    this.viewMode = 'fill';
    App.renderCurrentView();
  },

  toggleSubjectSelection(input) {
    const id = input.value;
    if (input.checked) {
      if (!this.selectedSubjectIds.includes(id)) this.selectedSubjectIds.push(id);
    } else {
      this.selectedSubjectIds = this.selectedSubjectIds.filter(sid => sid !== id);
    }
  },

  proceedToReview() {
    if (this.selectedSubjectIds.length === 0) {
      UIService.showToast("At least one eligible subject must be selected.", "danger");
      return;
    }
    this.viewMode = 'review';
    App.renderCurrentView();
  },

  toggleDeclaration(checked) {
    this.declarationAgreed = checked;
  },

  submitFormPrompt() {
    if (!this.declarationAgreed) {
      UIService.showToast("Please agree to the student declaration before submitting.", "warning");
      return;
    }

    UIService.openModal(
      "CONFIRM SUBMISSION",
      `<p style="color:var(--color-navy-dark); line-height:1.5;">Are you sure you want to submit the examination form? You will not be able to edit your selected subjects after submission.</p>`,
      [
        { text: 'Cancel', className: 'btn-secondary', onClick: () => UIService.closeModal() },
        {
          text: 'Confirm Submission',
          className: 'btn-primary',
          onClick: () => {
            UIService.closeModal();
            this.executeSubmission();
          }
        }
      ]
    );
  },

  executeSubmission() {
    const user = authService.getCurrentUser();
    const students = DataStore.get('STUDENTS');
    const student = students.find(s => s.email === user.email || s.userId === user.uid) || students[0];

    try {
      // 1. Create form
      const form = ExamFormService.createExamForm({
        studentId: student.id,
        examId: this.selectedExamPeriodId,
        selectedSubjectIds: this.selectedSubjectIds
      });

      // 2. Submit form with frontend payload for simulated backend verification test
      // In production, the backend would pull this from session/db natively.
      const payload = {
        name: student.name,
        registrationNumber: student.registrationNumber || student.rollNumber
      };
      
      const submitted = ExamFormService.submitExamForm(form.id, payload);
      
      this.reviewFormData = submitted;
      this.viewMode = 'success';
      if (submitted.isAutoApproved) {
        UIService.showToast("Exam form auto-approved! Hall ticket generated.", "success");
      } else {
        UIService.showToast("Exam form submitted. Pending manual review.", "warning");
      }
      App.renderCurrentView();
    } catch (err) {
      UIService.showToast(err.message, "danger");
    }
  },

  viewSubmittedForm(id) {
    this.viewingSubmissionId = id;
    this.viewMode = 'view_form';
    App.renderCurrentView();
  },

  backToFill() {
    this.viewMode = 'fill';
    App.renderCurrentView();
  },

  backToDashboard() {
    this.viewMode = 'dashboard';
    App.renderCurrentView();
  },

  // Helper date formatter
  formatDateDisplay(dateStr) {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = parts[0];
    const month = months[parseInt(parts[1], 10) - 1];
    const day = parts[2];
    return `${day} ${month} ${year}`;
  }
};

window.ExamFormView = ExamFormView;


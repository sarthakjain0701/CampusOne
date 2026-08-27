/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - ADMIN EXAM FORM MANAGEMENT VIEW CONTROLLER
   ========================================================================== */

const ExamFormManagementView = {
  selectedExamId: 'ALL',
  selectedSemester: 'ALL',
  selectedStatus: 'ALL',
  selectedDepartmentId: 'ALL',
  searchQuery: '',

  render(params = {}) {
    const user = authService.getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return `<div class="card" style="padding:2rem; text-align:center; color:var(--color-danger);">Access Denied. Admins only.</div>`;
    }

    const examPeriods = ExamFormService.getExamPeriods();
    const departments = DataStore.get('DEPARTMENTS');
    const submissions = ExamFormService.searchExamForms({
      examId: this.selectedExamId,
      semester: this.selectedSemester,
      status: this.selectedStatus,
      departmentId: this.selectedDepartmentId,
      query: this.searchQuery
    });

    const students = DataStore.get('STUDENTS');

    return `
      <div class="page-header" style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:1rem;">
        <div>
          <h1>EXAM FORM MANAGEMENT</h1>
          <p>Create exam registration periods and review student exam applications.</p>
        </div>
        <button class="btn-primary" onclick="ExamFormManagementView.openCreatePeriodModal()">
          <i data-lucide="plus-circle"></i> Create Exam Period
        </button>
      </div>

      <!-- EXAM PERIODS GRID -->
      <div class="card" style="margin-bottom: 2rem;">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="calendar"></i> Exam Registration Periods</h3>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; padding: 1rem 0;">
          ${examPeriods.map(p => `
            <div class="card" style="border: 1px solid var(--color-border); background:#F8FAFC; margin-bottom: 0; display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
                  <span class="status-badge ${p.status === 'OPEN' ? 'present' : p.status === 'UPCOMING' ? 'warning' : 'danger'}">${p.status}</span>
                  <span style="font-size:0.75rem; color:var(--color-text-muted);">Sem ${p.semester}</span>
                </div>
                <h4 style="font-weight:700; margin:0 0 0.5rem 0; color:var(--color-navy-dark);">${p.name}</h4>
                <p style="font-size:0.8rem; color:var(--color-text-muted); margin-bottom:1rem;">
                  Start: ${this.formatDateDisplay(p.startDate)}<br>
                  End: ${this.formatDateDisplay(p.endDate)}
                </p>
              </div>
              <div style="display:flex; gap:0.5rem; border-top:1px solid #E2E8F0; padding-top:0.75rem;">
                ${p.status !== 'CLOSED' ? `
                  <button class="btn-secondary" style="flex:1; padding:0.35rem; font-size:0.75rem; justify-content:center;" onclick="ExamFormManagementView.closePeriod('${p.id}')">
                    Close Period
                  </button>
                ` : `
                  <span style="font-size:0.75rem; color:var(--color-text-light); text-align:center; flex:1;">Registration Closed</span>
                `}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- FILTER BAR -->
      <div class="card" style="margin-bottom: 2rem;">
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; align-items:center;">
          <div>
            <label class="form-label" style="font-size:0.8rem;">Search Student / Roll No / App No</label>
            <input type="text" class="form-control" placeholder="Search..." value="${this.searchQuery}" onkeyup="ExamFormManagementView.handleSearch(this.value)">
          </div>
          <div>
            <label class="form-label" style="font-size:0.8rem;">Filter Exam</label>
            <select class="form-control" onchange="ExamFormManagementView.filterExam(this.value)">
              <option value="ALL">All Exams</option>
              ${examPeriods.map(p => `<option value="${p.id}" ${p.id === this.selectedExamId ? 'selected' : ''}>${p.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label" style="font-size:0.8rem;">Filter Status</label>
            <select class="form-control" onchange="ExamFormManagementView.filterStatus(this.value)">
              <option value="ALL" ${this.selectedStatus === 'ALL' ? 'selected' : ''}>All Statuses</option>
              <option value="SUBMITTED" ${this.selectedStatus === 'SUBMITTED' ? 'selected' : ''}>SUBMITTED</option>
              <option value="APPROVED" ${this.selectedStatus === 'APPROVED' ? 'selected' : ''}>APPROVED</option>
              <option value="REJECTED" ${this.selectedStatus === 'REJECTED' ? 'selected' : ''}>REJECTED</option>
              <option value="MANUAL_REVIEW_REQUIRED" ${this.selectedStatus === 'MANUAL_REVIEW_REQUIRED' ? 'selected' : ''}>MANUAL_REVIEW_REQUIRED</option>
            </select>
          </div>
          <div>
            <label class="form-label" style="font-size:0.8rem;">Filter Department</label>
            <select class="form-control" onchange="ExamFormManagementView.filterDepartment(this.value)">
              <option value="ALL">All Departments</option>
              ${departments.map(d => `<option value="${d.id}" ${d.id === this.selectedDepartmentId ? 'selected' : ''}>${d.name}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>

      <!-- SUBMISSIONS TABLE -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="clipboard-list"></i> Submissions (${submissions.length})</h3>
        </div>

        ${submissions.length === 0 ? `
          <div style="padding: 2rem; text-align: center; color: var(--color-text-muted);">
            No examination form submissions found matching criteria.
          </div>
        ` : `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Application Number</th>
                  <th>Student Name</th>
                  <th>Roll Number</th>
                  <th>Registration No</th>
                  <th>Exam Name</th>
                  <th>Semester</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${submissions.map(s => {
                  const student = students.find(st => st.id === s.studentId);
                  const period = examPeriods.find(p => p.id === s.examId);
                  
                  let badgeClass = 'warning';
                  if (s.status === 'APPROVED') badgeClass = 'present';
                  if (s.status === 'REJECTED') badgeClass = 'danger';
                  if (s.status === 'SUBMITTED') badgeClass = 'active';
                  if (s.status === 'MANUAL_REVIEW_REQUIRED') badgeClass = 'warning';

                  const statusDisplay = (s.status === 'APPROVED' && s.isAutoApproved) ? 'Auto Approved ✓' : (s.status === 'APPROVED' ? 'Approved' : s.status);

                  return `
                    <tr>
                      <td><strong>${s.applicationNumber}</strong></td>
                      <td>${student ? student.name : s.studentId}</td>
                      <td><code>${student ? (student.rollNumber || student.rollNo) : '—'}</code></td>
                      <td><code style="background:#F1F5F9;">${student ? student.registrationNumber : '—'}</code></td>
                      <td>${period ? period.name : '—'}</td>
                      <td>Semester ${s.semester}</td>
                      <td>${s.submittedAt ? this.formatDateDisplay(s.submittedAt) : '—'}</td>
                      <td><span class="status-badge ${badgeClass}">${statusDisplay}</span></td>
                      <td style="display:flex; gap:0.5rem; align-items:center;">
                        ${s.status === 'MANUAL_REVIEW_REQUIRED' || s.status === 'SUBMITTED' ? `
                          <button class="btn-primary" style="padding:0.3rem 0.65rem; font-size:0.75rem;" onclick="ExamFormManagementView.openReviewModal('${s.id}')">
                            <i data-lucide="check-square" style="width:12px; height:12px; display:inline;"></i> Review
                          </button>
                        ` : (s.status === 'APPROVED' ? `
                          <button class="btn-secondary" style="padding:0.3rem 0.65rem; font-size:0.75rem; color:var(--color-primary); border-color:var(--color-primary);" onclick="App.navigate('hall-ticket')">
                            <i data-lucide="file-text" style="width:12px; height:12px; display:inline;"></i> Hall Ticket
                          </button>
                          <button class="btn-secondary" style="padding:0.3rem 0.65rem; font-size:0.75rem;" onclick="ExamFormManagementView.openReviewModal('${s.id}')">
                            <i data-lucide="eye" style="width:12px; height:12px; display:inline;"></i> View
                          </button>
                        ` : `
                          <button class="btn-secondary" style="padding:0.3rem 0.65rem; font-size:0.75rem;" onclick="ExamFormManagementView.openReviewModal('${s.id}')">
                            <i data-lucide="eye" style="width:12px; height:12px; display:inline;"></i> View
                          </button>
                        `)}
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

  formatDateDisplay(dateStr) {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = parts[0];
    const month = months[parseInt(parts[1], 10) - 1];
    const day = parts[2];
    return `${day} ${month} ${year}`;
  },

  handleSearch(val) {
    this.searchQuery = val;
    App.renderCurrentView();
  },

  filterExam(examId) {
    this.selectedExamId = examId;
    App.renderCurrentView();
  },

  filterStatus(status) {
    this.selectedStatus = status;
    App.renderCurrentView();
  },

  filterDepartment(deptId) {
    this.selectedDepartmentId = deptId;
    App.renderCurrentView();
  },

  closePeriod(id) {
    UIService.showConfirm("Close Exam Period", "Are you sure you want to close this exam period? Students will not be able to fill new applications.", () => {
      ExamFormService.closePeriod(id);
      UIService.showToast("Exam period closed successfully.", "info");
      App.renderCurrentView();
    });
  },

  openCreatePeriodModal() {
    const modalHtml = `
      <form id="create-exam-period-form">
        <div class="form-group" style="margin-bottom:1rem;">
          <label class="form-label">Exam Name <span style="color:red;">*</span></label>
          <input type="text" id="p-name" class="form-control" placeholder="e.g. End Semester Examination (May 2026)" required>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <label class="form-label">Semester <span style="color:red;">*</span></label>
            <select id="p-sem" class="form-control" required>
              <option value="1">Semester 1</option>
              <option value="2" selected>Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
            </select>
          </div>
          <div>
            <label class="form-label">Academic Year</label>
            <input type="text" id="p-year" class="form-control" value="2026-27" required>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <label class="form-label">Start Date <span style="color:red;">*</span></label>
            <input type="date" id="p-start" class="form-control" required>
          </div>
          <div>
            <label class="form-label">End Date <span style="color:red;">*</span></label>
            <input type="date" id="p-end" class="form-control" required>
          </div>
        </div>
      </form>
    `;

    UIService.openModal(
      "CREATE EXAM REGISTRATION PERIOD",
      modalHtml,
      [
        { text: 'Cancel', className: 'btn-secondary', onClick: () => UIService.closeModal() },
        {
          text: 'Create Period',
          className: 'btn-primary',
          onClick: () => {
            const name = document.getElementById('p-name').value;
            const semester = document.getElementById('p-sem').value;
            const academicYear = document.getElementById('p-year').value;
            const startDate = document.getElementById('p-start').value;
            const endDate = document.getElementById('p-end').value;

            try {
              ExamFormService.createExamPeriod({ name, semester, academicYear, startDate, endDate });
              UIService.showToast("Exam period created successfully!", "success");
              UIService.closeModal();
              App.renderCurrentView();
            } catch (err) {
              UIService.showToast(err.message, "danger");
            }
          }
        }
      ]
    );
  },

  openReviewModal(id) {
    const sub = ExamFormService.getExamFormById(id);
    if (!sub) return;

    const student = DataStore.get('STUDENTS').find(st => st.id === sub.studentId);
    const examPeriod = ExamFormService.getExamPeriods().find(ep => ep.id === sub.examId);
    const subjects = subjectService.getSubjects();
    const selectedSubjects = subjects.filter(s => sub.selectedSubjectIds.includes(s.id));

    const contentHtml = `
      <div style="line-height:1.6; font-size:0.9rem;">
        <h4 style="margin-bottom:0.5rem; color:var(--color-navy-dark);">Student Information:</h4>
        <div style="background:#F8FAFC; padding:0.75rem; border-radius:6px; margin-bottom:1rem; display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem;">
          <div>Name: <strong>${student ? student.name : '—'}</strong></div>
          <div>Roll Number: <strong>${student ? (student.rollNumber || student.rollNo) : '—'}</strong></div>
          <div>Registration Number: <strong>${student ? student.registrationNumber : '—'}</strong></div>
          <div>Course/Branch: <strong>B.Tech / ${student ? student.department : '—'}</strong></div>
          <div>Semester: <strong>Semester ${sub.semester}</strong></div>
        </div>

        <h4 style="margin-bottom:0.5rem; color:var(--color-navy-dark);">Exam & Submission:</h4>
        <div style="background:#F8FAFC; padding:0.75rem; border-radius:6px; margin-bottom:1rem;">
          <div>Exam Period: <strong>${examPeriod ? examPeriod.name : '—'}</strong></div>
          <div>Submitted Date: <strong>${this.formatDateDisplay(sub.submittedAt)}</strong></div>
          <div>Application Status: <strong style="${sub.status === 'MANUAL_REVIEW_REQUIRED' ? 'color:#EAB308;' : 'color:#2563EB;'}">${sub.status}</strong></div>
          ${sub.status === 'MANUAL_REVIEW_REQUIRED' && sub.adminComment ? `
            <div style="margin-top:0.5rem; padding-top:0.5rem; border-top:1px solid #E2E8F0; color:#DC2626; font-size:0.85rem;">
              <i data-lucide="alert-triangle" style="width:14px; height:14px; display:inline; margin-bottom:-2px;"></i> 
              <strong>Review Reason:</strong> ${sub.adminComment}
            </div>
          ` : ''}
          ${sub.status === 'APPROVED' && sub.isAutoApproved ? `
            <div style="margin-top:0.5rem; padding-top:0.5rem; border-top:1px solid #E2E8F0; color:#16A34A; font-size:0.85rem;">
              <i data-lucide="check-circle" style="width:14px; height:14px; display:inline; margin-bottom:-2px;"></i> 
              Automatically verified and approved.
            </div>
          ` : ''}
        </div>

        <h4 style="margin-bottom:0.5rem; color:var(--color-navy-dark);">Selected Subjects (${selectedSubjects.length}):</h4>
        <div style="max-height: 150px; overflow-y:auto; border:1px solid #E2E8F0; padding:0.5rem; border-radius:6px; background:#FFF; margin-bottom:1rem;">
          <ul style="padding-left:1.25rem; margin:0;">
            ${selectedSubjects.map(s => `<li>${s.name} (${s.code})</li>`).join('')}
          </ul>
        </div>

        <div class="form-group">
          <label class="form-label">Review Remarks / Rejection Reason</label>
          <input type="text" id="review-comment" class="form-control" placeholder="Add comment (required for rejection)" value="${sub.adminComment || ''}">
        </div>
      </div>
    `;

    UIService.openModal(
      `Review Exam Form — ${sub.applicationNumber}`,
      contentHtml,
      [
        { text: 'Cancel', className: 'btn-secondary', onClick: () => UIService.closeModal() },
        {
          text: 'Reject Application',
          className: 'btn-secondary',
          onClick: () => {
            const comment = document.getElementById('review-comment').value;
            try {
              ExamFormService.rejectExamForm(id, comment);
              UIService.showToast("Application rejected.", "warning");
              UIService.closeModal();
              App.renderCurrentView();
            } catch (err) {
              UIService.showToast(err.message, "danger");
            }
          }
        },
        {
          text: 'Approve Application',
          className: 'btn-primary',
          onClick: () => {
            const comment = document.getElementById('review-comment').value;
            UIService.closeModal();
            UIService.showConfirm("Confirm Approval", "Are you sure you want to approve this examination form?", () => {
              ExamFormService.approveExamForm(id);
              if (comment && comment.trim() !== '') {
                DataStore.updateItem('EXAM_FORMS', id, { adminComment: comment.trim() });
              }
              UIService.showToast("Application approved successfully!", "success");
              App.renderCurrentView();
            });
          }
        }
      ]
    );
  }
};

window.ExamFormManagementView = ExamFormManagementView;


/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - MARK ATTENDANCE VIEW (WITH PRIVACY SCOPING)
   ========================================================================== */

const MarkAttendanceView = {
  selectedClassId: null,
  selectedSubjectId: null,
  selectedDate: new Date().toISOString().split('T')[0],
  studentState: {},
  originalStudentState: {},
  mode: null, // 'MARK', 'VIEW', 'EDIT'

  render(params = {}) {
    const user = authService.getCurrentUser();
    if (!user) return `<div>Please log in.</div>`;

    let classes = classService.getClasses();
    let subjects = subjectService.getSubjects();
    
    let filtersChanged = false;

    if (params.classId && classes.some(c => c.id === params.classId)) { this.selectedClassId = params.classId; filtersChanged = true; }
    if (params.subjectId && subjects.some(s => s.id === params.subjectId)) { this.selectedSubjectId = params.subjectId; filtersChanged = true; }
    if (params.date) { this.selectedDate = params.date; filtersChanged = true; }

    if (AuthorizationService.isAcademicStaff(user)) {
      if (typeof AttendanceAssignmentService !== 'undefined') {
        // Enforce strict attendance assignment for Faculty
        const hasAccess = AttendanceAssignmentService.canMarkAttendance(user.id, this.selectedClassId, this.selectedSubjectId, this.selectedDate);
        if (!hasAccess && this.selectedClassId && this.selectedSubjectId) {
          return AuthorizationService.renderAccessDeniedBanner("You are not assigned to take attendance for this specific class, subject, and date.");
        } else if (!this.selectedClassId) {
          return AuthorizationService.renderAccessDeniedBanner("Please select a session from your Dashboard.");
        }
        classes = classes.filter(c => c.id === this.selectedClassId);
        subjects = subjects.filter(s => s.id === this.selectedSubjectId);
      } else {
        const authorizedClassIds = AuthorizationService.getAuthorizedClassIds(user);
        const authorizedSubjectIds = AuthorizationService.getAuthorizedSubjectIds(user);
        classes = classes.filter(c => authorizedClassIds.includes(c.id));
        subjects = subjects.filter(s => authorizedSubjectIds.includes(s.id));
        if (classes.length === 0 || subjects.length === 0) {
          return AuthorizationService.renderAccessDeniedBanner("You do not have any assigned classes or subjects to mark attendance.");
        }
      }
    }

    if (!this.selectedClassId || !classes.some(c => c.id === this.selectedClassId)) {
      this.selectedClassId = classes[0] ? classes[0].id : null;
    }
    if (!this.selectedSubjectId || !subjects.some(s => s.id === this.selectedSubjectId)) {
      this.selectedSubjectId = subjects[0] ? subjects[0].id : null;
    }

    if (params.mode) {
      this.mode = params.mode;
      filtersChanged = true;
    } else if (filtersChanged || !this.mode) {
      this.mode = null;
    }

    // Security Check: Force VIEW mode for students to prevent any UI edit state
    if (user.role === 'STUDENT') {
      this.mode = 'VIEW';
    }

    const students = studentService.getStudents().filter(s => s.classId === this.selectedClassId || !s.classId);

    // Determine mode and populate state
    const existing = attendanceService.getSessionAttendance(this.selectedClassId, this.selectedSubjectId, this.selectedDate);
    
    if (!this.mode) {
      if (existing && existing.length > 0) {
        this.mode = 'VIEW';
      } else {
        this.mode = 'MARK';
      }
    }

    if (filtersChanged || !this.studentState || Object.keys(this.studentState).length === 0) {
      this.studentState = {};
      if (existing && existing.length > 0) {
        existing.forEach(record => {
          this.studentState[record.studentId] = record.status;
        });
      } else {
        students.forEach(s => {
          this.studentState[s.id] = 'NOT_MARKED';
        });
      }
    }

    let actionsBarHtml = '';
    if (this.mode === 'VIEW') {
      actionsBarHtml = `
        <div class="attendance-actions-bar" style="background:#F8FAFC; border-color:#CBD5E1;">
          <div style="display:flex; align-items:center; gap:0.5rem; color:var(--color-navy-dark); font-weight:600;">
            <i data-lucide="lock" style="color:var(--color-text-muted);"></i> Attendance Already Marked
          </div>
          <div>
            ${user.role !== 'STUDENT' ? `
            <button class="btn-primary" onclick="MarkAttendanceView.editAttendance()">
              <i data-lucide="edit"></i> Edit Attendance
            </button>
            ` : ''}
          </div>
        </div>
      `;
    } else if (this.mode === 'EDIT') {
      actionsBarHtml = `
        <div class="attendance-actions-bar" style="background:#FFFBEB; border-color:#FDE68A;">
          <div class="toggle-switch-group">
            <span style="font-size:0.85rem; font-weight:600; color:var(--color-navy-dark);">Quick Actions:</span>
            <button class="attendance-toggle-btn present-all" onclick="MarkAttendanceView.markAll('PRESENT')">
              <i data-lucide="check"></i> Mark All Present
            </button>
            <button class="attendance-toggle-btn absent-all" onclick="MarkAttendanceView.markAll('ABSENT')">
              <i data-lucide="x"></i> Mark All Absent
            </button>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn-secondary" onclick="MarkAttendanceView.cancelEdit()">
              Cancel
            </button>
            <button class="btn-primary" onclick="MarkAttendanceView.promptSave()">
              <i data-lucide="save"></i> Update Attendance
            </button>
          </div>
        </div>
      `;
    } else {
      // MARK mode
      actionsBarHtml = `
        <div class="attendance-actions-bar">
          <div class="toggle-switch-group">
            <span style="font-size:0.85rem; font-weight:600; color:var(--color-navy-dark);">Quick Actions:</span>
            <button class="attendance-toggle-btn present-all" onclick="MarkAttendanceView.markAll('PRESENT')">
              <i data-lucide="check"></i> Mark All Present
            </button>
            <button class="attendance-toggle-btn absent-all" onclick="MarkAttendanceView.markAll('ABSENT')">
              <i data-lucide="x"></i> Mark All Absent
            </button>
          </div>
          <div>
            <button class="btn-primary" onclick="MarkAttendanceView.promptSave()">
              <i data-lucide="save"></i> Save Attendance Record
            </button>
          </div>
        </div>
      `;
    }

    const formattedDate = new Date(this.selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    return `
      <div class="page-header">
        <h1 style="font-size:1.75rem; font-weight:800; color:var(--color-navy-dark); margin:0 0 0.25rem 0;">Mark Attendance</h1>
        <p style="color:var(--color-text-muted); font-size:0.9rem; margin:0;">
          Select class, subject, and session date to record or modify student attendance. ${AuthorizationService.isAcademicStaff(user) ? '<strong style="color:var(--color-primary);">(Scoped to assigned classes)</strong>' : ''}
        </p>
      </div>

      <!-- SELECTION CARDS GRID -->
      <div class="mark-attendance-grid">
        <div class="attendance-select-card">
          <label><i data-lucide="layers"></i> Select Class</label>
          ${AuthorizationService.isAcademicStaff(user) ? `
             <div style="font-weight: 700; color: var(--color-navy-dark); font-size: 1.05rem; padding-top: 0.25rem;">
               ${classes.find(c => c.id === this.selectedClassId)?.name || 'Unknown Class'}
             </div>
             <input type="hidden" id="sel-att-class" value="${this.selectedClassId}">
          ` : `
          <select id="sel-att-class" class="form-select" style="width:100%; font-weight:600;" onchange="MarkAttendanceView.onFilterChange()" ${this.mode === 'EDIT' ? 'disabled' : ''}>
            ${classes.map(c => `<option value="${c.id}" ${c.id === this.selectedClassId ? 'selected' : ''}>${c.name} (Sem ${c.semester})</option>`).join('')}
          </select>
          `}
        </div>

        <div class="attendance-select-card">
          <label><i data-lucide="book-open"></i> Select Subject</label>
          ${AuthorizationService.isAcademicStaff(user) ? `
             <div style="font-weight: 700; color: var(--color-navy-dark); font-size: 1.05rem; padding-top: 0.25rem;">
               ${subjects.find(s => s.id === this.selectedSubjectId)?.name || 'Unknown Subject'}
             </div>
             <input type="hidden" id="sel-att-subject" value="${this.selectedSubjectId}">
          ` : `
          <select id="sel-att-subject" class="form-select" style="width:100%; font-weight:600;" onchange="MarkAttendanceView.onFilterChange()" ${this.mode === 'EDIT' ? 'disabled' : ''}>
            ${subjects.map(s => `<option value="${s.id}" ${s.id === this.selectedSubjectId ? 'selected' : ''}>${s.name} (${s.code})</option>`).join('')}
          </select>
          `}
        </div>

        <div class="attendance-select-card">
          <label><i data-lucide="calendar"></i> Session Date</label>
          <div style="font-weight: 700; color: var(--color-primary); font-size: 1.1rem; padding-top: 0.25rem; display: flex; align-items: center; justify-content: space-between;">
            <span id="display-att-date">${formattedDate}</span>
            ${this.mode !== 'EDIT' && user.role !== 'FACULTY' ? `<input type="date" id="sel-att-date" class="form-input" style="width: 24px; height: 24px; padding: 0; border: none; background: transparent; opacity: 0; position: absolute; right: 1rem; cursor: pointer;" value="${this.selectedDate}" onchange="MarkAttendanceView.onFilterChange()"> <i data-lucide="edit-3" style="cursor: pointer; color: var(--color-text-muted); width: 16px; height: 16px;"></i>` : ''}
          </div>
          ${(this.mode === 'EDIT' || AuthorizationService.isAcademicStaff(user)) ? `<input type="hidden" id="sel-att-date" value="${this.selectedDate}">` : ''}
        </div>
      </div>

      <!-- ATTENDANCE ACTIONS TOOLBAR -->
      ${actionsBarHtml}

      <!-- STUDENT ATTENDANCE TABLE -->
      <div class="table-container">
        <table class="custom-table" style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background:#F8FAFC; border-bottom:2px solid #E2E8F0;">
              <th>#</th>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${students.length === 0 ? `
              <tr>
                <td colspan="4" style="text-align:center; padding:3rem;">
                  <i data-lucide="user-x" style="font-size:2rem; color:var(--color-text-light);"></i>
                  <p style="margin-top:0.5rem; color:var(--color-text-muted);">No students enrolled in this class section.</p>
                </td>
              </tr>
            ` : students.map((stu, idx) => `
              <tr style="border-bottom:1px solid #F1F5F9;">
                <td>${idx + 1}</td>
                <td><strong>${stu.registrationNumber || stu.rollNumber}</strong></td>
                <td>
                  <div style="font-weight:600; color:var(--color-navy-dark);">${stu.name}</div>
                  <div style="font-size:0.75rem; color:var(--color-text-muted);">${stu.email}</div>
                </td>
                <td id="status-cell-${stu.id}">
                  ${this.mode === 'VIEW' ? `
                    <span class="status-badge ${this.studentState[stu.id] === 'PRESENT' ? 'present' : (this.studentState[stu.id] === 'ABSENT' ? 'absent' : 'not-marked')}">
                      ${this.studentState[stu.id] === 'NOT_MARKED' ? 'NOT MARKED' : this.studentState[stu.id]}
                    </span>
                  ` : `
                    <div class="switch-control" id="switch-${stu.id}">
                      <button class="switch-btn present ${this.studentState[stu.id] === 'PRESENT' ? 'active' : ''}" onclick="MarkAttendanceView.setStatus('${stu.id}', 'PRESENT')">PRESENT</button>
                      <button class="switch-btn absent ${this.studentState[stu.id] === 'ABSENT' ? 'active' : ''}" onclick="MarkAttendanceView.setStatus('${stu.id}', 'ABSENT')">ABSENT</button>
                    </div>
                    ${this.studentState[stu.id] === 'NOT_MARKED' ? `<div id="not-marked-warn-${stu.id}" style="font-size:0.75rem; color:#EF4444; margin-top:0.25rem; font-weight:600;"><i data-lucide="alert-circle" style="width:12px; height:12px; display:inline-block; vertical-align:middle;"></i> Not Marked</div>` : `<div id="not-marked-warn-${stu.id}" style="display:none; font-size:0.75rem; color:#EF4444; margin-top:0.25rem; font-weight:600;"><i data-lucide="alert-circle" style="width:12px; height:12px; display:inline-block; vertical-align:middle;"></i> Not Marked</div>`}
                  `}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  onFilterChange() {
    this.selectedClassId = document.getElementById('sel-att-class').value;
    this.selectedSubjectId = document.getElementById('sel-att-subject').value;
    this.selectedDate = document.getElementById('sel-att-date').value;
    this.mode = null;
    App.renderCurrentView();
  },

  setStatus(studentId, status) {
    if (this.mode === 'VIEW') return;
    this.studentState[studentId] = status;
    
    // Direct DOM update for immediate feedback
    const switchContainer = document.getElementById(`switch-${studentId}`);
    if (switchContainer) {
      const presentBtn = switchContainer.querySelector('.switch-btn.present');
      const absentBtn = switchContainer.querySelector('.switch-btn.absent');
      if (presentBtn) presentBtn.classList.toggle('active', status === 'PRESENT');
      if (absentBtn) absentBtn.classList.toggle('active', status === 'ABSENT');
    }

    const warning = document.getElementById(`not-marked-warn-${studentId}`);
    if (warning) {
      warning.style.display = status === 'NOT_MARKED' ? 'block' : 'none';
    }
  },

  markAll(status) {
    if (this.mode === 'VIEW') return;
    Object.keys(this.studentState).forEach(id => {
      this.setStatus(id, status);
    });
  },

  editAttendance() {
    this.mode = 'EDIT';
    this.originalStudentState = { ...this.studentState };
    App.renderCurrentView();
  },

  cancelEdit() {
    this.mode = 'VIEW';
    this.studentState = { ...this.originalStudentState };
    App.renderCurrentView();
  },

  promptSave() {
    const students = studentService.getStudents().filter(s => s.classId === this.selectedClassId || !s.classId);
    if (students.length === 0) {
      UIService.showToast("No students to save attendance for.", "warning");
      return;
    }

    if (this.mode === 'MARK') {
      const isDuplicate = attendanceService.checkDuplicateAttendance(this.selectedClassId, this.selectedSubjectId, this.selectedDate);
      if (isDuplicate) {
        UIService.showToast("Attendance has already been recorded for this class and date.", "warning");
      }
    }

    const notMarkedStudents = students.filter(s => this.studentState[s.id] === 'NOT_MARKED' || !this.studentState[s.id]);
    
    if (notMarkedStudents.length > 0) {
      const studentNames = notMarkedStudents.map(s => s.name).join('<br>');
      
      UIService.showConfirm(
        "Incomplete Attendance",
        `<strong>${notMarkedStudents.length} students are not marked.</strong><br><br>They will be automatically marked <strong>ABSENT</strong>.<br>Continue?<br><div style="max-height: 100px; overflow-y: auto; margin-top: 10px; font-size: 0.85rem; color: #64748b;">${studentNames}</div>`,
        () => {
          // Automatically mark unmarked students as ABSENT
          notMarkedStudents.forEach(s => {
            this.setStatus(s.id, 'ABSENT');
          });
          this._executeSave(students);
        }
      );
    } else {
      const presentCount = Object.values(this.studentState).filter(s => s === 'PRESENT').length;
      const absentCount = students.length - presentCount;
      const formattedDate = new Date(this.selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

      const title = this.mode === 'EDIT' ? "Confirm Attendance Update" : "Confirm Attendance Submission";
      const msg = this.mode === 'EDIT' 
        ? `Are you sure you want to update attendance for <strong>${formattedDate}</strong>?<br><br>Present: <strong style="color:var(--color-success);">${presentCount}</strong> | Absent: <strong style="color:var(--color-danger);">${absentCount}</strong> | Total: <strong>${students.length}</strong>`
        : `Save attendance record for <strong>${formattedDate}</strong>?<br><br>Present: <strong style="color:var(--color-success);">${presentCount}</strong> | Absent: <strong style="color:var(--color-danger);">${absentCount}</strong> | Total: <strong>${students.length}</strong>`;

      UIService.showConfirm(title, msg, () => {
        this._executeSave(students);
      });
    }
  },

  async _executeSave(students) {
    const records = students.map(s => ({ studentId: s.id, status: this.studentState[s.id] || 'PRESENT' }));
    const currentUser = authService.getCurrentUser();

    // Simulate Loading State (e.g. changing Save Attendance button to Saving...)
    const saveBtn = document.querySelector('.btn-primary[onclick="MarkAttendanceView.promptSave()"]');
    if (saveBtn) {
      saveBtn.innerHTML = '<i data-lucide="loader" class="spin"></i> Saving Attendance...';
      saveBtn.disabled = true;
      if (window.lucide) window.lucide.createIcons();
    }

    try {
      await attendanceService.saveAttendance(this.selectedClassId, this.selectedSubjectId, this.selectedDate, currentUser ? currentUser.id : 'FAC001', records, currentUser);
      UIService.showToast("Attendance updated successfully.", "success");
      this.mode = 'VIEW';
      App.renderCurrentView();
    } catch (err) {
      UIService.showToast(err.message, "danger");
      if (saveBtn) {
        saveBtn.innerHTML = this.mode === 'EDIT' ? '<i data-lucide="save"></i> Update Attendance' : '<i data-lucide="save"></i> Save Attendance Record';
        saveBtn.disabled = false;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  }
};

window.MarkAttendanceView = MarkAttendanceView;

/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - FACULTY ATTENDANCE ASSIGNMENTS (ADMIN)
   ========================================================================== */

const AttendanceAssignmentsView = {
  assignments: [],
  depts: [],
  classes: [],
  subjects: [],
  faculty: [],
  timetables: [],
  loading: true,

  // Stepper state
  isModalOpen: false,
  currentStep: 1, // 1: Academic, 2: Subject/Time, 3: Faculty, 4: Review

  // Form state
  selectedYear: '2026-27',
  selectedDept: '',
  selectedSem: '',
  selectedClass: '',
  selectedSubject: '',
  selectedFaculty: '',
  selectedTimetable: '',

  // Drawer state
  isDrawerOpen: false,
  drawerAssignmentId: null,

  afterRender() {
    if (this.loading) {
      this.fetchData();
    }
  },

  async fetchData() {
    try {
      this.depts = typeof departmentService !== 'undefined' ? await departmentService.getDepartmentsFromFirestore() : [];
      this.classes = typeof classService !== 'undefined' ? await classService.getClassesFromFirestore() : [];
      this.subjects = typeof subjectService !== 'undefined' ? await subjectService.getSubjectsFromFirestore() : [];
      this.faculty = typeof facultyService !== 'undefined' ? await facultyService.getFacultyFromFirestore() : [];
      this.timetables = typeof TimetableService !== 'undefined' ? await TimetableService.getAllTimetables() : [];
      
      this.assignments = typeof AttendanceAssignmentService !== 'undefined' ? await AttendanceAssignmentService.getAssignments() : [];
      this.loading = false;
      App.renderCurrentView();
    } catch (err) {
      this.loading = false;
      UIService.showToast(err.message || "Failed to load attendance assignments.", "danger");
      App.renderCurrentView();
    }
  },

  render() {
    if (this.loading) {
      return `
        <div class="page-header">
          <h1>Faculty Attendance Assignments</h1>
          <p>Assign faculty members to specific timetable sessions.</p>
        </div>
        <div style="padding: 2rem;">
          <div class="skeleton" style="height: 60px; margin-bottom: 1rem;"></div>
          <div class="skeleton" style="height: 400px;"></div>
        </div>
      `;
    }

    const assignments = this.assignments;
    const depts = this.depts;
    const classes = this.classes;
    const subjects = this.subjects;
    const faculty = this.faculty;
    const timetables = this.timetables;

    return `
      <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:var(--space-xl);">
        <div>
          <h1 style="margin-bottom:var(--space-xs);">Faculty Attendance Assignments</h1>
          <p>Assign faculty members to timetable sessions.</p>
        </div>
        <div>
          <button class="btn-primary" onclick="AttendanceAssignmentsView.openAssignModal()">
            <i data-lucide="plus"></i> Assign Faculty
          </button>
        </div>
      </div>

      ${assignments.length === 0 ? `
        <div style="text-align:center; padding:5rem 2rem; background:#FFF; border-radius:var(--radius-lg); border:1px solid var(--color-border);">
          <div style="width:64px; height:64px; border-radius:50%; background:#F1F5F9; display:flex; align-items:center; justify-content:center; margin:0 auto 1.5rem auto;">
            <i data-lucide="calendar-x" style="width:32px; height:32px; color:var(--color-text-light);"></i>
          </div>
          <h2 style="font-size:1.25rem; font-weight:700; color:var(--color-navy-dark); margin-bottom:0.5rem;">No attendance assignments yet</h2>
          <p style="color:var(--color-text-muted); max-width:400px; margin:0 auto 1.5rem auto;">Create an assignment to connect faculty members with a timetable session.</p>
          <button class="btn-primary" onclick="AttendanceAssignmentsView.openAssignModal()">
            <i data-lucide="plus"></i> Assign Faculty
          </button>
        </div>
      ` : `
        <!-- EXISTING ASSIGNMENTS TABLE -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Faculty</th>
                <th>Department</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Session</th>
                <th>Status</th>
                <th style="width: 50px;"></th>
              </tr>
            </thead>
            <tbody>
              ${assignments.map(a => {
                const fac = faculty.find(f => f.id === a.facultyId);
                const sub = subjects.find(s => s.id === a.subjectId);
                const cls = classes.find(c => c.id === a.classId);
                const dept = depts.find(d => d.id === a.departmentId);
                const tt = timetables.find(t => t.id === a.timetableId);
                return `
                  <tr>
                    <td><strong>${fac ? fac.name : a.facultyId}</strong></td>
                    <td>${dept ? dept.name : a.departmentId}</td>
                    <td>${cls ? cls.name : a.classId}</td>
                    <td><div style="font-weight:600; color:var(--color-navy-dark);">${sub ? sub.name : a.subjectId}</div></td>
                    <td>${tt ? (tt.day + ' • ' + tt.startTime + '-' + tt.endTime) : 'N/A'}</td>
                    <td>
                      <span class="status-badge ${a.status === 'ACTIVE' ? 'present' : 'absent'}">${a.status}</span>
                    </td>
                    <td>
                      <div class="action-menu-container">
                        <button class="btn-icon" onclick="AttendanceAssignmentsView.toggleActionMenu('${a.id}', event)">
                          <i data-lucide="more-vertical"></i>
                        </button>
                        <div class="action-menu-dropdown" id="action-menu-${a.id}">
                          <button class="action-menu-item" onclick="AttendanceAssignmentsView.openDetailsDrawer('${a.id}')">
                            <i data-lucide="eye" style="width:16px;"></i> View Details
                          </button>
                          ${a.status === 'ACTIVE' 
                            ? `<button class="action-menu-item" onclick="AttendanceAssignmentsView.toggleStatus('${a.id}', 'INACTIVE')"><i data-lucide="pause-circle" style="width:16px;"></i> Disable</button>`
                            : `<button class="action-menu-item" onclick="AttendanceAssignmentsView.toggleStatus('${a.id}', 'ACTIVE')"><i data-lucide="play-circle" style="width:16px;"></i> Enable</button>`
                          }
                          <button class="action-menu-item danger" onclick="AttendanceAssignmentsView.confirmDelete('${a.id}')">
                            <i data-lucide="trash-2" style="width:16px;"></i> Delete Assignment
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}

      <!-- ASSIGN FACULTY MODAL (STEPPER) -->
      <div class="modal-overlay ${this.isModalOpen ? 'active' : ''}" id="assign-modal">
        <div class="modal-container" style="max-width: 650px;">
          <div class="modal-header">
            <h3 class="modal-title">Assign Faculty</h3>
            <button class="btn-close" onclick="AttendanceAssignmentsView.closeAssignModal()"><i data-lucide="x"></i></button>
          </div>
          <div class="modal-body">
            <!-- Stepper Progress -->
            <div style="display:flex; justify-content:space-between; margin-bottom:2rem; position:relative;">
              <div style="position:absolute; top:12px; left:0; right:0; height:2px; background:#E2E8F0; z-index:1;"></div>
              ${[1,2,3,4].map(step => `
                <div style="position:relative; z-index:2; display:flex; flex-direction:column; align-items:center; gap:0.5rem; width:25%;">
                  <div style="width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700; ${this.currentStep >= step ? 'background:var(--color-primary); color:#FFF;' : 'background:#F1F5F9; color:var(--color-text-muted); border:2px solid #E2E8F0;'} transition:var(--transition-fast);">
                    ${this.currentStep > step ? '<i data-lucide="check" style="width:14px;"></i>' : step}
                  </div>
                  <div style="font-size:0.75rem; font-weight:600; color:${this.currentStep >= step ? 'var(--color-navy-dark)' : 'var(--color-text-muted)'}; text-align:center;">
                    ${step===1?'Context':step===2?'Academic':step===3?'Faculty':'Review'}
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- STEP 1: CONTEXT -->
            <div style="display: ${this.currentStep === 1 ? 'block' : 'none'};">
              <div class="form-group">
                <label class="form-label">Academic Year</label>
                <select id="aa-year" class="form-control" onchange="AttendanceAssignmentsView.updateFilter('year', this.value)">
                  <option value="2026-27" ${this.selectedYear === '2026-27' ? 'selected' : ''}>2026-27</option>
                  <option value="2025-26" ${this.selectedYear === '2025-26' ? 'selected' : ''}>2025-26</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Department</label>
                <select id="aa-dept" class="form-control" onchange="AttendanceAssignmentsView.updateFilter('dept', this.value)">
                  <option value="">Select Department...</option>
                  ${depts.map(d => `<option value="${d.id}" ${this.selectedDept === d.id ? 'selected' : ''}>${d.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Semester</label>
                <select id="aa-sem" class="form-control" onchange="AttendanceAssignmentsView.updateFilter('sem', this.value)" ${!this.selectedDept ? 'disabled' : ''}>
                  <option value="">Select Semester...</option>
                  ${[1,2,3,4,5,6,7,8].map(s => `<option value="${s}" ${this.selectedSem == s ? 'selected' : ''}>Semester ${s}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Section / Class</label>
                <select id="aa-class" class="form-control" onchange="AttendanceAssignmentsView.updateFilter('class', this.value)" ${!this.selectedDept || !this.selectedSem ? 'disabled' : ''}>
                  ${!this.selectedDept || !this.selectedSem 
                    ? '<option value="">Select Department and Semester first</option>' 
                    : (this.getFilteredClasses().length === 0 
                       ? '<option value="">No sections/classes available</option>' 
                       : '<option value="">Select Section / Class ▼</option>' + this.getFilteredClasses().map(c => `<option value="${c.id}" ${this.selectedClass === c.id ? 'selected' : ''}>${c.name}</option>`).join(''))
                  }
                </select>
              </div>
            </div>

            <!-- STEP 2: ACADEMIC -->
            <div style="display: ${this.currentStep === 2 ? 'block' : 'none'};">
              <div class="form-group">
                <label class="form-label">Subject</label>
                <select id="aa-subject" class="form-control" onchange="AttendanceAssignmentsView.updateFilter('subject', this.value)">
                  <option value="">Select Subject...</option>
                  ${this.getFilteredSubjects().map(s => `<option value="${s.id}" ${this.selectedSubject === s.id ? 'selected' : ''}>${s.name} (${s.code})</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Timetable Session</label>
                <select id="aa-timetable" class="form-control" onchange="AttendanceAssignmentsView.updateFilter('timetable', this.value)">
                  <option value="">Select Session...</option>
                  ${this.getFilteredTimetables().length === 0 && this.selectedSubject ? '<option value="" disabled>No scheduled slots found</option>' : ''}
                  ${this.getFilteredTimetables().map(t => {
                     return `<option value="${t.id}" ${this.selectedTimetable === t.id ? 'selected' : ''}>${t.day} • ${t.startTime} - ${t.endTime} (Room: ${t.room})</option>`;
                  }).join('')}
                </select>
              </div>
            </div>

            <!-- STEP 3: FACULTY -->
            <div style="display: ${this.currentStep === 3 ? 'block' : 'none'};">
              <div class="form-group">
                <label class="form-label">Assign Faculty</label>
                <select id="aa-faculty" class="form-control" onchange="AttendanceAssignmentsView.updateFilter('faculty', this.value)">
                  <option value="">Select Faculty...</option>
                  ${this.getFilteredFaculty().map(f => `<option value="${f.id}" ${this.selectedFaculty === f.id ? 'selected' : ''}>${f.name} (${f.email})</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- STEP 4: REVIEW -->
            <div style="display: ${this.currentStep === 4 ? 'block' : 'none'};">
              <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:var(--radius-md); padding:1.5rem; margin-bottom:1rem;">
                <h4 style="margin-bottom:1rem; color:var(--color-navy-dark); border-bottom:1px solid #E2E8F0; padding-bottom:0.5rem;">Assignment Summary</h4>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                  <div class="detail-group">
                    <div class="detail-label">Academic Year</div>
                    <div class="detail-value">${this.selectedYear}</div>
                  </div>
                  <div class="detail-group">
                    <div class="detail-label">Department & Class</div>
                    <div class="detail-value">${this.getDeptName()} • ${this.getClassName()}</div>
                  </div>
                  <div class="detail-group">
                    <div class="detail-label">Subject</div>
                    <div class="detail-value">${this.getSubjectName()}</div>
                  </div>
                  <div class="detail-group">
                    <div class="detail-label">Faculty</div>
                    <div class="detail-value">${this.getFacultyName()}</div>
                  </div>
                  <div class="detail-group" style="grid-column:span 2;">
                    <div class="detail-label">Timetable Session</div>
                    <div class="detail-value">${this.getTimetableName()}</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
          <div class="modal-footer">
            <button class="btn-secondary" onclick="AttendanceAssignmentsView.prevStep()" ${this.currentStep === 1 ? 'style="display:none;"' : ''}>Back</button>
            <button class="btn-secondary" onclick="AttendanceAssignmentsView.closeAssignModal()" ${this.currentStep > 1 ? 'style="display:none;"' : ''}>Cancel</button>
            <button class="btn-primary" onclick="AttendanceAssignmentsView.nextStep()" ${this.currentStep === 4 ? 'style="display:none;"' : ''} ${!this.canProceed() ? 'disabled' : ''}>Next</button>
            <button class="btn-primary" onclick="AttendanceAssignmentsView.handleAssign()" ${this.currentStep !== 4 ? 'style="display:none;"' : ''} id="btn-confirm-assign">Confirm Assignment</button>
          </div>
        </div>
      </div>

      <!-- VIEW DETAILS DRAWER -->
      <div class="drawer-overlay ${this.isDrawerOpen ? 'active' : ''}" id="details-drawer" onclick="if(event.target===this) AttendanceAssignmentsView.closeDetailsDrawer()">
        <div class="drawer-panel">
          <div class="drawer-header">
            <h3 class="drawer-title">Assignment Details</h3>
            <button class="btn-close" onclick="AttendanceAssignmentsView.closeDetailsDrawer()"><i data-lucide="x"></i></button>
          </div>
          <div class="drawer-body">
            ${this.renderDrawerContent()}
          </div>
          <div class="drawer-footer">
            <button class="btn-secondary" onclick="AttendanceAssignmentsView.closeDetailsDrawer()">Close</button>
          </div>
        </div>
      </div>
    `;
  },

  getFilteredClasses() {
    return this.classes.filter(c => 
      (!this.selectedDept || c.departmentId === this.selectedDept || c.department === this.selectedDept) &&
      (!this.selectedSem || c.semester == this.selectedSem)
    );
  },
  getFilteredSubjects() {
    return this.subjects.filter(s => 
      (!this.selectedDept || s.departmentId === this.selectedDept || s.department === this.selectedDept) &&
      (!this.selectedSem || s.semester == this.selectedSem)
    );
  },
  getFilteredTimetables() {
    return this.timetables.filter(t => 
      t.status === 'ACTIVE' &&
      (!this.selectedClass || t.sectionId === this.selectedClass || t.classId === this.selectedClass) &&
      (!this.selectedSubject || t.subjectId === this.selectedSubject)
    );
  },
  getFilteredFaculty() {
    return this.faculty.filter(f => !this.selectedDept || f.departmentId === this.selectedDept);
  },

  getDeptName() { const d = this.depts.find(x => x.id === this.selectedDept); return d ? d.name : ''; },
  getClassName() { const c = this.classes.find(x => x.id === this.selectedClass); return c ? c.name : ''; },
  getSubjectName() { const s = this.subjects.find(x => x.id === this.selectedSubject); return s ? s.name : ''; },
  getFacultyName() { const f = this.faculty.find(x => x.id === this.selectedFaculty); return f ? f.name : ''; },
  getTimetableName() { 
    const t = this.timetables.find(x => x.id === this.selectedTimetable); 
    return t ? `${t.day} (${t.startTime}-${t.endTime})` : ''; 
  },

  canProceed() {
    if (this.currentStep === 1) return this.selectedDept && this.selectedSem && this.selectedClass;
    if (this.currentStep === 2) return this.selectedSubject && this.selectedTimetable;
    if (this.currentStep === 3) return this.selectedFaculty;
    return true;
  },

  updateFilter(field, value) {
    if (field === 'year') this.selectedYear = value;
    if (field === 'dept') { this.selectedDept = value; this.selectedSem = ''; this.selectedClass = ''; this.selectedSubject = ''; this.selectedTimetable = ''; this.selectedFaculty = ''; }
    if (field === 'sem') { this.selectedSem = value; this.selectedClass = ''; this.selectedSubject = ''; this.selectedTimetable = ''; }
    if (field === 'class') { this.selectedClass = value; this.selectedSubject = ''; this.selectedTimetable = ''; }
    if (field === 'subject') { this.selectedSubject = value; this.selectedTimetable = ''; }
    if (field === 'faculty') { this.selectedFaculty = value; }
    if (field === 'timetable') { this.selectedTimetable = value; }
    App.renderCurrentView();
  },

  openAssignModal() {
    this.isModalOpen = true;
    this.currentStep = 1;
    this.selectedDept = '';
    this.selectedSem = '';
    this.selectedClass = '';
    this.selectedSubject = '';
    this.selectedTimetable = '';
    this.selectedFaculty = '';
    App.renderCurrentView();
  },
  closeAssignModal() {
    this.isModalOpen = false;
    App.renderCurrentView();
  },
  nextStep() {
    if (this.currentStep < 4 && this.canProceed()) {
      this.currentStep++;
      App.renderCurrentView();
    }
  },
  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      App.renderCurrentView();
    }
  },

  async handleAssign() {
    const btn = document.getElementById('btn-confirm-assign');
    if(btn) { btn.disabled = true; btn.innerHTML = 'Processing...'; }

    try {
      await AttendanceAssignmentService.createAssignment({
        academicYear: this.selectedYear,
        departmentId: this.selectedDept,
        semester: this.selectedSem,
        classId: this.selectedClass,
        subjectId: this.selectedSubject,
        facultyId: this.selectedFaculty,
        timetableId: this.selectedTimetable
      });
      
      this.isModalOpen = false;
      
      // Success Modal
      UIService.showConfirm(
        "Assignment Created ✓", 
        `<div style="text-align:left;">
          <p><strong>${this.getFacultyName()}</strong> has been assigned to:</p>
          <ul style="margin: 10px 0 10px 20px;">
            <li>${this.getSubjectName()}</li>
            <li>${this.getClassName()}</li>
            <li>${this.getTimetableName()}</li>
          </ul>
        </div>`, 
        () => {
          this.loading = true;
          this.fetchData();
        }
      );

    } catch (err) {
      if(btn) { btn.disabled = false; btn.innerHTML = 'Confirm Assignment'; }
      UIService.showToast("Unable to create assignment. Please try again.", "danger");
      console.error(err);
    }
  },

  toggleActionMenu(id, e) {
    e.stopPropagation();
    document.querySelectorAll('.action-menu-dropdown').forEach(d => d.classList.remove('active'));
    const menu = document.getElementById(`action-menu-${id}`);
    if (menu) menu.classList.toggle('active');
  },

  openDetailsDrawer(id) {
    this.drawerAssignmentId = id;
    this.isDrawerOpen = true;
    document.querySelectorAll('.action-menu-dropdown').forEach(d => d.classList.remove('active'));
    App.renderCurrentView();
  },
  closeDetailsDrawer() {
    this.isDrawerOpen = false;
    this.drawerAssignmentId = null;
    App.renderCurrentView();
  },
  renderDrawerContent() {
    if (!this.drawerAssignmentId) return '';
    const a = this.assignments.find(x => x.id === this.drawerAssignmentId);
    if (!a) return '<p>Assignment not found.</p>';

    const fac = this.faculty.find(f => f.id === a.facultyId) || {};
    const sub = this.subjects.find(s => s.id === a.subjectId) || {};
    const cls = this.classes.find(c => c.id === a.classId) || {};
    const dept = this.depts.find(d => d.id === a.departmentId) || {};
    const tt = this.timetables.find(t => t.id === a.timetableId) || {};

    return `
      <div style="margin-bottom: 2rem;">
        <h4 style="margin-bottom: 1rem; color: var(--color-primary); border-bottom: 1px solid #E2E8F0; padding-bottom: 0.5rem;">Faculty Details</h4>
        <div class="detail-group"><div class="detail-label">Name</div><div class="detail-value">${fac.name || a.facultyId}</div></div>
        <div class="detail-group"><div class="detail-label">Email</div><div class="detail-value">${fac.email || 'N/A'}</div></div>
        <div class="detail-group"><div class="detail-label">Department</div><div class="detail-value">${dept.name || a.departmentId}</div></div>
      </div>

      <div style="margin-bottom: 2rem;">
        <h4 style="margin-bottom: 1rem; color: var(--color-primary); border-bottom: 1px solid #E2E8F0; padding-bottom: 0.5rem;">Academic Details</h4>
        <div class="detail-group"><div class="detail-label">Class / Section</div><div class="detail-value">${cls.name || a.classId} (Sem ${a.semester || 'N/A'})</div></div>
        <div class="detail-group"><div class="detail-label">Subject</div><div class="detail-value">${sub.name || a.subjectId} (${sub.code || 'N/A'})</div></div>
        <div class="detail-group"><div class="detail-label">Academic Year</div><div class="detail-value">${a.academicYear}</div></div>
      </div>

      <div style="margin-bottom: 2rem;">
        <h4 style="margin-bottom: 1rem; color: var(--color-primary); border-bottom: 1px solid #E2E8F0; padding-bottom: 0.5rem;">Timetable Session</h4>
        <div class="detail-group"><div class="detail-label">Day & Time</div><div class="detail-value">${tt.day || 'N/A'} • ${tt.startTime || ''} - ${tt.endTime || ''}</div></div>
        <div class="detail-group"><div class="detail-label">Room</div><div class="detail-value">${tt.room || 'N/A'}</div></div>
      </div>

      <div>
        <h4 style="margin-bottom: 1rem; color: var(--color-primary); border-bottom: 1px solid #E2E8F0; padding-bottom: 0.5rem;">System Information</h4>
        <div class="detail-group"><div class="detail-label">Status</div>
          <div class="detail-value"><span class="status-badge ${a.status === 'ACTIVE' ? 'present' : 'absent'}">${a.status}</span></div>
        </div>
      </div>
    `;
  },

  async toggleStatus(id, newStatus) {
    document.querySelectorAll('.action-menu-dropdown').forEach(d => d.classList.remove('active'));
    try {
      await AttendanceAssignmentService.updateAssignmentStatus(id, newStatus);
      UIService.showToast(`Assignment marked as ${newStatus}`, "info");
      this.loading = true;
      this.fetchData();
    } catch (err) {
      UIService.showToast("Failed to update status", "danger");
    }
  },

  confirmDelete(id) {
    document.querySelectorAll('.action-menu-dropdown').forEach(d => d.classList.remove('active'));
    UIService.showConfirm("Delete Assignment?", "This will remove the attendance assignment permanently. This action cannot be undone.", async () => {
      try {
        await AttendanceAssignmentService.deleteAssignment(id);
        UIService.showToast("Assignment deleted successfully", "info");
        this.loading = true;
        this.fetchData();
      } catch(err) {
        UIService.showToast("Failed to delete assignment", "danger");
      }
    });
  }
};

// Global click handler to close action menus
document.addEventListener('click', (e) => {
  if(!e.target.closest('.action-menu-container')) {
    document.querySelectorAll('.action-menu-dropdown').forEach(d => d.classList.remove('active'));
  }
});

window.AttendanceAssignmentsView = AttendanceAssignmentsView;

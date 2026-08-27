/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - FACULTY ATTENDANCE ASSIGNMENTS (ADMIN)
   ========================================================================== */

const AttendanceAssignmentsView = {
  selectedYear: '2026-27',
  selectedDept: '',
  selectedSem: '',
  selectedClass: '',
  selectedSubject: '',
  selectedFaculty: '',
  selectedTimetable: '',

  render() {
    const assignments = typeof AttendanceAssignmentService !== 'undefined' ? AttendanceAssignmentService.getAssignments() : [];
    const depts = typeof departmentService !== 'undefined' ? departmentService.getDepartments() : [];
    const classes = typeof classService !== 'undefined' ? classService.getClasses() : [];
    const subjects = typeof subjectService !== 'undefined' ? subjectService.getSubjects() : [];
    const faculty = typeof facultyService !== 'undefined' ? facultyService.getFaculty() : [];
    const timetables = typeof TimetableService !== 'undefined' ? TimetableService.getAllTimetables() : [];

    // Filter Logic
    const filteredClasses = classes.filter(c => 
      (!this.selectedDept || c.departmentId === this.selectedDept || c.department === this.selectedDept) &&
      (!this.selectedSem || c.semester == this.selectedSem)
    );

    const filteredSubjects = subjects.filter(s => 
      (!this.selectedDept || s.departmentId === this.selectedDept || s.department === this.selectedDept) &&
      (!this.selectedSem || s.semester == this.selectedSem)
    );

    const filteredTimetables = timetables.filter(t => 
      t.status === 'ACTIVE' &&
      (!this.selectedClass || t.sectionId === this.selectedClass || t.classId === this.selectedClass) &&
      (!this.selectedSubject || t.subjectId === this.selectedSubject)
    );

    const filteredFaculty = faculty.filter(f => 
       !this.selectedDept || f.departmentId === this.selectedDept
    );

    return `
      <div class="page-header">
        <h1>Faculty Attendance Assignments</h1>
        <p>Assign faculty members to specific timetable sessions for marking attendance.</p>
      </div>

      <!-- CREATE ASSIGNMENT CARD -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="calendar-check"></i> Create New Attendance Assignment</h3>
        </div>
        <form id="attendance-assignment-form" onsubmit="AttendanceAssignmentsView.handleAssign(event)">
          <div class="mark-attendance-grid" style="grid-template-columns: repeat(4, 1fr);">
            
            <div class="attendance-select-card">
              <label>Academic Year</label>
              <select id="aa-year" class="form-select" onchange="AttendanceAssignmentsView.updateFilter('year', this.value)">
                <option value="2026-27" ${this.selectedYear === '2026-27' ? 'selected' : ''}>2026-27</option>
                <option value="2025-26" ${this.selectedYear === '2025-26' ? 'selected' : ''}>2025-26</option>
              </select>
            </div>

            <div class="attendance-select-card">
              <label>Department</label>
              <select id="aa-dept" class="form-select" onchange="AttendanceAssignmentsView.updateFilter('dept', this.value)" required>
                <option value="">Select Department...</option>
                ${depts.map(d => `<option value="${d.id}" ${this.selectedDept === d.id ? 'selected' : ''}>${d.name}</option>`).join('')}
              </select>
            </div>

            <div class="attendance-select-card">
              <label>Semester</label>
              <select id="aa-sem" class="form-select" onchange="AttendanceAssignmentsView.updateFilter('sem', this.value)" required ${!this.selectedDept ? 'disabled' : ''}>
                <option value="">Select Semester...</option>
                ${[1,2,3,4,5,6,7,8].map(s => `<option value="${s}" ${this.selectedSem == s ? 'selected' : ''}>Semester ${s}</option>`).join('')}
              </select>
            </div>

            <div class="attendance-select-card">
              <label>Section / Class</label>
              <select id="aa-class" class="form-select" onchange="AttendanceAssignmentsView.updateFilter('class', this.value)" required ${!this.selectedDept || !this.selectedSem ? 'disabled' : ''}>
                ${!this.selectedDept || !this.selectedSem 
                  ? '<option value="">Select Department and Semester first</option>' 
                  : (filteredClasses.length === 0 
                     ? '<option value="">No sections/classes available for the selected criteria.</option>' 
                     : '<option value="">Select Section / Class ▼</option>' + filteredClasses.map(c => `<option value="${c.id}" ${this.selectedClass === c.id ? 'selected' : ''}>${c.name}</option>`).join(''))
                }
              </select>
            </div>

            <div class="attendance-select-card">
              <label>Subject</label>
              <select id="aa-subject" class="form-select" onchange="AttendanceAssignmentsView.updateFilter('subject', this.value)" required ${!this.selectedClass ? 'disabled' : ''}>
                <option value="">Select Subject...</option>
                ${filteredSubjects.map(s => `<option value="${s.id}" ${this.selectedSubject === s.id ? 'selected' : ''}>${s.name} (${s.code})</option>`).join('')}
              </select>
            </div>
            
            <div class="attendance-select-card">
              <label>Faculty</label>
              <select id="aa-faculty" class="form-select" onchange="AttendanceAssignmentsView.updateFilter('faculty', this.value)" required ${!this.selectedSubject ? 'disabled' : ''}>
                <option value="">Select Faculty...</option>
                ${filteredFaculty.map(f => `<option value="${f.id}" ${this.selectedFaculty === f.id ? 'selected' : ''}>${f.name}</option>`).join('')}
              </select>
            </div>

            <div class="attendance-select-card" style="grid-column: span 2;">
              <label>Timetable Session</label>
              <select id="aa-timetable" class="form-select" onchange="AttendanceAssignmentsView.updateFilter('timetable', this.value)" required ${!this.selectedFaculty ? 'disabled' : ''}>
                <option value="">Select Session...</option>
                ${filteredTimetables.length === 0 && this.selectedSubject ? '<option value="" disabled>No scheduled slots found for this subject & class</option>' : ''}
                ${filteredTimetables.map(t => {
                   return `<option value="${t.id}" ${this.selectedTimetable === t.id ? 'selected' : ''}>${t.day} • ${t.startTime} - ${t.endTime} (Room: ${t.room})</option>`;
                }).join('')}
              </select>
            </div>

          </div>

          <div style="display:flex; justify-content:flex-end; margin-top:1.5rem;">
            <button type="submit" class="btn-primary" ${!this.selectedTimetable ? 'disabled' : ''}>
              <i data-lucide="check-circle"></i> Assign Faculty
            </button>
          </div>
        </form>
      </div>

      <!-- EXISTING ASSIGNMENTS -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="list"></i> Active Attendance Assignments</h3>
        </div>
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Faculty</th>
                <th>Subject</th>
                <th>Class</th>
                <th>Day</th>
                <th>Time Slot</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${assignments.length === 0 ? `
                <tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--color-text-muted);">No attendance assignments configured.</td></tr>
              ` : assignments.map(a => {
                const fac = faculty.find(f => f.id === a.facultyId);
                const sub = subjects.find(s => s.id === a.subjectId);
                const cls = classes.find(c => c.id === a.classId);
                const tt = timetables.find(t => t.id === a.timetableId);
                return `
                  <tr>
                    <td><strong>${fac ? fac.name : a.facultyId}</strong></td>
                    <td><div style="font-weight:600; color:var(--color-navy-dark);">${sub ? sub.name : a.subjectId}</div></td>
                    <td><span class="status-badge active">${cls ? cls.name : a.classId}</span></td>
                    <td><strong>${tt ? tt.day : 'N/A'}</strong></td>
                    <td>${tt ? (tt.startTime + ' - ' + tt.endTime) : 'N/A'}</td>
                    <td>
                      <span class="status-badge ${a.status === 'ACTIVE' ? 'present' : 'absent'}">${a.status}</span>
                    </td>
                    <td>
                      ${a.status === 'ACTIVE' 
                        ? `<button class="btn-xs btn-secondary" onclick="AttendanceAssignmentsView.toggleStatus('${a.id}', 'INACTIVE')">Disable</button>`
                        : `<button class="btn-xs btn-primary" onclick="AttendanceAssignmentsView.toggleStatus('${a.id}', 'ACTIVE')">Enable</button>`
                      }
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  updateFilter(field, value) {
    if (field === 'year') this.selectedYear = value;
    if (field === 'dept') { this.selectedDept = value; this.selectedSem = ''; this.selectedClass = ''; this.selectedSubject = ''; this.selectedTimetable = ''; }
    if (field === 'sem') { this.selectedSem = value; this.selectedClass = ''; this.selectedSubject = ''; this.selectedTimetable = ''; }
    if (field === 'class') { this.selectedClass = value; this.selectedSubject = ''; this.selectedTimetable = ''; }
    if (field === 'subject') { this.selectedSubject = value; this.selectedTimetable = ''; }
    if (field === 'faculty') { this.selectedFaculty = value; }
    if (field === 'timetable') { this.selectedTimetable = value; }
    
    App.renderCurrentView();
  },

  handleAssign(e) {
    e.preventDefault();
    try {
      AttendanceAssignmentService.createAssignment({
        academicYear: this.selectedYear,
        departmentId: this.selectedDept,
        semester: this.selectedSem,
        classId: this.selectedClass,
        subjectId: this.selectedSubject,
        facultyId: this.selectedFaculty,
        timetableId: this.selectedTimetable
      });
      UIService.showToast("Attendance assignment created successfully.", "success");
      
      // Reset form but keep dept/sem/class for rapid assigning
      this.selectedSubject = '';
      this.selectedTimetable = '';
      App.renderCurrentView();
    } catch (err) {
      UIService.showToast(err.message, "danger");
    }
  },

  toggleStatus(id, newStatus) {
    try {
      AttendanceAssignmentService.updateAssignmentStatus(id, newStatus);
      UIService.showToast(`Assignment marked as ${newStatus}`, "info");
      App.renderCurrentView();
    } catch (err) {
      UIService.showToast(err.message, "danger");
    }
  }
};

window.AttendanceAssignmentsView = AttendanceAssignmentsView;


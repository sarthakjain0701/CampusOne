/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - FACULTY ASSIGNMENT (SERVICE CONNECTED)
   ========================================================================== */

const AssignmentsView = {
  assignments: [],
  faculty: [],
  subjects: [],
  classes: [],
  loading: true,

  afterRender() {
    if (this.loading) {
      this.fetchData();
    }
  },

  async fetchData() {
    try {
      this.faculty = typeof facultyService !== 'undefined' ? (facultyService.getFaculty ? facultyService.getFaculty() : []) : [];
      this.subjects = typeof subjectService !== 'undefined' ? (subjectService.getSubjects ? subjectService.getSubjects() : []) : [];
      this.classes = typeof classService !== 'undefined' ? (classService.getClasses ? classService.getClasses() : []) : [];
      this.assignments = await assignmentService.getAssignments();
      this.loading = false;
      App.renderCurrentView();
    } catch (err) {
      this.loading = false;
      UIService.showToast(err.message || "Failed to load assignments.", "danger");
      App.renderCurrentView();
    }
  },

  render() {
    if (this.loading) {
      return `
        <div class="page-header">
          <h1>Faculty Assignment</h1>
          <p>Assign faculty members to teach subjects for specific classes and academic sessions.</p>
        </div>
        <div class="card" style="padding: 3rem; text-align: center;">
          <div style="display: inline-block; width: 36px; height: 36px; border: 3px solid #E2E8F0; border-top-color: #2563EB; border-radius: 50%; animation: spin 1s infinite linear;"></div>
          <p style="margin-top: 1rem; color: var(--color-text-muted);">Loading assignments...</p>
        </div>
      `;
    }

    const assignments = this.assignments;
    const faculty = this.faculty;
    const subjects = this.subjects;
    const classes = this.classes;

    return `
      <div class="page-header">
        <h1>Faculty Assignment</h1>
        <p>Assign faculty members to teach subjects for specific classes and academic sessions.</p>
      </div>

      <!-- ASSIGNMENT FORM CARD -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="link"></i> Assign Faculty to Subject & Class</h3>
        </div>

        <form id="assign-faculty-form" onsubmit="AssignmentsView.handleAssign(event)">
          <div class="mark-attendance-grid" style="grid-template-columns: repeat(4, 1fr);">
            <div class="attendance-select-card">
              <label>Select Faculty</label>
              <select id="asgn-fac-id" class="form-select" style="width:100%;" required>
                ${faculty.map(f => `<option value="${f.id}">${f.name} (${f.employeeId})</option>`).join('')}
              </select>
            </div>

            <div class="attendance-select-card">
              <label>Select Subject</label>
              <select id="asgn-sub-id" class="form-select" style="width:100%;" required>
                ${subjects.map(s => `<option value="${s.id}">${s.name} (${s.code})</option>`).join('')}
              </select>
            </div>

            <div class="attendance-select-card">
              <label>Select Class</label>
              <select id="asgn-cls-id" class="form-select" style="width:100%;" required>
                ${classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
              </select>
            </div>

            <div class="attendance-select-card">
              <label>Academic Year</label>
              <input type="text" id="asgn-ay" class="form-input" value="2026-27" style="padding-left:1rem;" required>
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end; margin-top:1rem;">
            <button type="submit" class="btn-primary" style="width:auto;">
              <i data-lucide="plus-circle"></i> Assign Faculty Member
            </button>
          </div>
        </form>
      </div>

      <!-- EXISTING ASSIGNMENTS LIST -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="layers"></i> Existing Faculty Assignments</h3>
        </div>

        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Faculty Name</th>
                <th>Subject</th>
                <th>Class</th>
                <th>Academic Year</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${assignments.length === 0 ? `
                <tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--color-text-muted);">No assignments configured yet.</td></tr>
              ` : assignments.map(a => {
                const fac = faculty.find(f => f.id === a.facultyId);
                const sub = subjects.find(s => s.id === a.subjectId);
                const cls = classes.find(c => c.id === a.classId);
                return `
                  <tr>
                    <td><strong>${fac ? fac.name : a.facultyId}</strong></td>
                    <td>${sub ? sub.name : a.subjectId} (${sub ? sub.code : ''})</td>
                    <td><span class="status-badge active">${cls ? cls.name : a.classId}</span></td>
                    <td>${a.academicYear}</td>
                    <td><span class="status-badge present">${a.status}</span></td>
                    <td>
                      <button class="btn-icon-sm danger" onclick="AssignmentsView.deleteAssignment('${a.id}')" title="Delete"><i data-lucide="trash-2"></i></button>
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

  async handleAssign(e) {
    e.preventDefault();
    const facultyId = document.getElementById('asgn-fac-id').value;
    const subjectId = document.getElementById('asgn-sub-id').value;
    const classId = document.getElementById('asgn-cls-id').value;
    const academicYear = document.getElementById('asgn-ay').value;

    try {
      await assignmentService.addAssignment(facultyId, subjectId, classId, academicYear);
      UIService.showToast("Faculty assigned successfully.", "success");
      this.loading = true; // refresh
      App.renderCurrentView();
    } catch (err) {
      UIService.showToast(err.message, "danger");
    }
  },

  deleteAssignment(id) {
    UIService.showConfirm("Remove Assignment?", "Delete this faculty assignment?", async () => {
      try {
        await assignmentService.deleteAssignment(id);
        UIService.showToast("Faculty assignment removed.", "success");
        this.loading = true; // refresh
        App.renderCurrentView();
      } catch (err) {
        UIService.showToast(err.message, "danger");
      }
    });
  }
};

window.AssignmentsView = AssignmentsView;


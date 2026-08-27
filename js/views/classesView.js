/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - CLASS MANAGEMENT (SERVICE CONNECTED)
   ========================================================================== */

const ClassesView = {
  render() {
    const classes = classService.getClasses();

    return `
      <div class="page-header">
        <h1>Class Management</h1>
        <p>Manage student class sections, semester cohorts, and academic sessions.</p>
      </div>

      <div class="toolbar">
        <div></div>
        <div>
          <button class="btn-primary" onclick="ClassesView.openAddModal()">
            <i data-lucide="folder-plus"></i> Add New Class
          </button>
        </div>
      </div>

      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Class Name</th>
              <th>Department</th>
              <th>Semester</th>
              <th>Section</th>
              <th>Academic Year</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${classes.map(c => `
              <tr>
                <td><strong>${c.name}</strong></td>
                <td>${c.department}</td>
                <td>Semester ${c.semester}</td>
                <td>Section ${c.section}</td>
                <td>${c.academicYear}</td>
                <td><span class="status-badge ${c.status === 'ACTIVE' ? 'present' : 'absent'}">${c.status}</span></td>
                <td>
                  <button class="btn-icon-sm danger" onclick="ClassesView.deleteClass('${c.id}')" title="Delete"><i data-lucide="trash-2"></i></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  openAddModal() {
    const depts = departmentService.getDepartments();
    const html = `
      <form id="add-cls-form" onsubmit="return false;">
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Department *</label>
            <select id="m-cls-dept" class="form-select">
              <option value="" disabled selected>Select Department ▼</option>
              ${depts.map(d => `<option value="${d.name}">${d.name} (${d.code})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Academic Year *</label>
            <select id="m-cls-year" class="form-select">
              <option value="2025-26">2025-26</option>
              <option value="2026-27" selected>2026-27</option>
            </select>
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Semester *</label>
            <select id="m-cls-sem" class="form-select">
              <option value="" disabled selected>Select Semester ▼</option>
              ${[1,2,3,4,5,6,7,8].map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Section *</label>
            <select id="m-cls-sec" class="form-select">
              <option value="" disabled selected>Select Section ▼</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Class Display Name * (Auto-generated or Custom)</label>
          <input type="text" id="m-cls-name" class="form-input" placeholder="e.g. CSE-A" required style="font-family:monospace;">
        </div>
      </form>
    `;

    UIService.openModal("Add Class/Section", html, [
      { text: "Cancel", className: "btn-secondary", onClick: () => UIService.closeModal() },
      { text: "Add Class", className: "btn-primary", onClick: () => this.saveClass() }
    ]);
  },

  saveClass() {
    const data = {
      name: document.getElementById('m-cls-name').value,
      department: document.getElementById('m-cls-dept').value,
      semester: document.getElementById('m-cls-sem').value,
      section: document.getElementById('m-cls-sec').value
    };

    try {
      classService.addClass(data);
      UIService.closeModal();
      UIService.showToast("Class section added successfully.", "success");
      App.renderCurrentView();
    } catch (err) {
      UIService.showToast(err.message, "danger");
    }
  },

  deleteClass(id) {
    UIService.showConfirm("Delete Class?", "Remove this class record?", () => {
      try {
        classService.deleteClass(id);
        UIService.showToast("Class deleted.", "success");
        App.renderCurrentView();
      } catch (err) {
        UIService.showToast(err.message, "danger");
      }
    });
  }
};

window.ClassesView = ClassesView;


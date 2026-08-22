/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - SUBJECT MANAGEMENT (SERVICE CONNECTED)
   ========================================================================== */

const SubjectsView = {
  render() {
    const subjects = subjectService.getSubjects();

    return `
      <div class="page-header">
        <h1>Subject Management</h1>
        <p>Manage course codes, subject names, semesters, and academic credits.</p>
      </div>

      <div class="toolbar">
        <div></div>
        <div>
          <button class="btn-primary" onclick="SubjectsView.openAddModal()">
            <i data-lucide="book-plus"></i> Add Subject
          </button>
        </div>
      </div>

      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Subject Code</th>
              <th>Subject Name</th>
              <th>Department</th>
              <th>Semester</th>
              <th>Credits</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${subjects.map(s => `
              <tr>
                <td><strong>${s.code}</strong></td>
                <td><div style="font-weight:600; color:var(--color-navy-dark);">${s.name}</div></td>
                <td>${s.department}</td>
                <td>Sem ${s.semester}</td>
                <td>${s.credits} Credits</td>
                <td><span class="status-badge ${s.status === 'ACTIVE' ? 'present' : 'absent'}">${s.status}</span></td>
                <td>
                  <button class="btn-icon-sm danger" onclick="SubjectsView.deleteSub('${s.id}')" title="Delete"><i data-lucide="trash-2"></i></button>
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
      <form id="add-sub-form" onsubmit="return false;">
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Subject Code *</label>
            <input type="text" id="m-sub-code" class="form-input" placeholder="e.g. CS205" required style="font-family:monospace;">
          </div>
          <div class="form-group">
            <label class="form-label">Subject Name *</label>
            <input type="text" id="m-sub-name" class="form-input" placeholder="e.g. Operating Systems" required>
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Department *</label>
            <select id="m-sub-dept" class="form-select">
              <option value="" disabled selected>Select Department ▼</option>
              ${depts.map(d => `<option value="${d.name}">${d.name} (${d.code})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Semester *</label>
            <select id="m-sub-sem" class="form-select">
              <option value="" disabled selected>Select Semester ▼</option>
              ${[1,2,3,4,5,6,7,8].map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Subject Type *</label>
            <select id="m-sub-type" class="form-select">
              <option value="Core">Core</option>
              <option value="Elective">Elective</option>
              <option value="Lab">Lab / Practical</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Credits *</label>
            <input type="number" id="m-sub-credits" class="form-input" value="4" min="1" max="6" required>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select id="m-sub-status" class="form-select">
            <option value="ACTIVE" selected>Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </form>
    `;

    UIService.openModal("Add Subject", html, [
      { text: "Cancel", className: "btn-secondary", onClick: () => UIService.closeModal() },
      { text: "Add Subject", className: "btn-primary", onClick: () => this.saveSub() }
    ]);
  },

  saveSub() {
    const data = {
      code: document.getElementById('m-sub-code').value,
      name: document.getElementById('m-sub-name').value,
      department: document.getElementById('m-sub-dept').value,
      semester: document.getElementById('m-sub-sem').value,
      credits: document.getElementById('m-sub-credits').value
    };

    try {
      subjectService.addSubject(data);
      UIService.closeModal();
      UIService.showToast("Subject added successfully.", "success");
      App.renderCurrentView();
    } catch (err) {
      UIService.showToast(err.message, "danger");
    }
  },

  deleteSub(id) {
    UIService.showConfirm("Delete Subject?", "Remove this subject record?", () => {
      try {
        subjectService.deleteSubject(id);
        UIService.showToast("Subject deleted.", "success");
        App.renderCurrentView();
      } catch (err) {
        UIService.showToast(err.message, "danger");
      }
    });
  }
};

window.SubjectsView = SubjectsView;

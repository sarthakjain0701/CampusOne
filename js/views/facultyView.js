/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - FACULTY MANAGEMENT (FIRESTORE CONNECTED)
   Bidirectional: Firestore ↔ GUI with real-time listeners.
   ========================================================================== */

const FacultyView = {
  _cachedFaculty: [],

  render() {
    const departments = departmentService.getDepartments();

    return `
      <div class="page-header">
        <h1>Staff Management</h1>
        <p>Manage faculty, lab assistants, librarians, and department affiliations.</p>
      </div>

      <div class="toolbar">
        <div class="filter-group">
          <input type="text" class="search-input" style="width:240px; background:white;" placeholder="Search faculty name, ID..." onkeyup="FacultyView.onSearch(this.value)">
        </div>

        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          <button class="btn-primary" onclick="FacultyView.openAddModal()">
            <i data-lucide="user-plus"></i> Add New Staff
          </button>
          <button class="btn-secondary" onclick="BulkImportModal.open('FACULTY')" style="background:#F8FAFC; border-color:#CBD5E1; color:var(--color-navy-dark);">
            <i data-lucide="upload-cloud"></i> Import Faculty
          </button>
          <button class="btn-secondary" onclick="ExcelImportService.downloadFacultyTemplate()" style="background:#F8FAFC; border-color:#CBD5E1; color:var(--color-navy-dark);">
            <i data-lucide="download"></i> Download Template
          </button>
        </div>
      </div>

      <div class="table-container">
        <table class="custom-table" id="faculty-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Designation</th>
              <th>Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="faculty-table-body">
            <tr><td colspan="8" style="text-align:center; padding:2rem;"><i data-lucide="loader" class="spin"></i> Loading Staff...</td></tr>
          </tbody>
        </table>
      </div>
    `;
  },

  afterRender() {
    facultyService.listenToFaculty((err, faculty) => {
      const tbody = document.getElementById('faculty-table-body');
      if (!tbody) return;

      if (err) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--color-danger);">${err.message}</td></tr>`;
        return;
      }

      this._cachedFaculty = faculty;
      this._renderTableRows(faculty);
    });
  },

  _renderTableRows(faculty) {
    const tbody = document.getElementById('faculty-table-body');
    if (!tbody) return;

    if (faculty.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--color-text-muted);">No staff members found.</td></tr>';
    } else {
      tbody.innerHTML = faculty.map(f => {
        const roleDisplay = AuthorizationService.getRoleDisplayName(f.role || 'FACULTY');
        const roleBadgeClass = (f.role || 'FACULTY').toLowerCase().replace('_', '-');
        return `
        <tr>
          <td><strong>${f.employeeId || 'N/A'}</strong></td>
          <td><div style="font-weight:600; color:var(--color-navy-dark);">${f.name || 'N/A'}</div></td>
          <td>${f.email || 'N/A'}</td>
          <td><span class="role-badge ${roleBadgeClass}" style="font-size:0.7rem; padding:0.15rem 0.5rem;">${roleDisplay}</span></td>
          <td>${f.designation || 'Staff'}</td>
          <td><span class="status-badge active">${f.department || 'N/A'}</span></td>
          <td><span class="status-badge ${f.status === 'ACTIVE' ? 'present' : 'absent'}">${f.status || 'N/A'}</span></td>
          <td>
            <div class="action-btns">
              <button class="btn-icon-sm" onclick="FacultyView.openEditModal('${f.id}')" title="Edit"><i data-lucide="edit-2"></i></button>
              <button class="btn-icon-sm danger" onclick="FacultyView.deleteFaculty('${f.id}')" title="Delete"><i data-lucide="trash-2"></i></button>
            </div>
          </td>
        </tr>
      `;
      }).join('');
    }
    if (window.lucide) window.lucide.createIcons();
  },

  onSearch(query) {
    const q = (query || '').toLowerCase();
    if (!q) {
      this._renderTableRows(this._cachedFaculty);
      return;
    }
    const filtered = this._cachedFaculty.filter(f =>
      (f.name || '').toLowerCase().includes(q) ||
      (f.employeeId || '').toLowerCase().includes(q) ||
      (f.email || '').toLowerCase().includes(q)
    );
    this._renderTableRows(filtered);
  },

  openAddModal() {
    const depts = departmentService.getDepartments();
    const subjects = subjectService.getSubjects();
    
    const html = `
      <form id="add-fac-form" onsubmit="return false;">
        <div class="form-group">
          <label class="form-label">System Role *</label>
          <input type="text" id="m-fac-role-display" class="form-input" value="FACULTY" readonly style="background-color: var(--color-bg-main); font-weight: 600; color: var(--color-text-muted);">
          <input type="hidden" id="m-fac-role-val" value="FACULTY">
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">First Name *</label>
            <input type="text" id="m-fac-fname" class="form-input" placeholder="e.g. Shivansh" required oninput="FacultyView.updateGeneratedEmail()">
          </div>
          <div class="form-group">
            <label class="form-label">Last Name *</label>
            <input type="text" id="m-fac-lname" class="form-input" placeholder="e.g. Jain" required oninput="FacultyView.updateGeneratedEmail()">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Official Faculty Email (Auto-generated)</label>
          <div style="position:relative;">
            <i data-lucide="mail" style="position:absolute; left:1rem; top:50%; transform:translateY(-50%); color:var(--color-primary); width:16px; height:16px;"></i>
            <input type="email" id="m-fac-email" class="form-input" readonly placeholder="Will be generated automatically..." style="padding-left:2.5rem; background-color: var(--color-bg-main); font-family: monospace; color: var(--color-primary); font-weight: 600;">
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Employee / Faculty ID *</label>
            <input type="text" id="m-fac-empid" class="form-input" placeholder="e.g. EMP-FAC-103" required>
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="tel" id="m-fac-phone" class="form-input" placeholder="+91 9876543210">
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Department *</label>
            <select id="m-fac-dept" class="form-select">
              <option value="" disabled selected>Select Department ▼</option>
              ${depts.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Designation *</label>
            <select id="m-fac-designation" class="form-select" onchange="FacultyView.onDesignationChange(this.value, 'add')">
              <option value="" disabled selected>Select Designation ▼</option>
              <option value="Assistant Professor">Assistant Professor</option>
              <option value="Associate Professor">Associate Professor</option>
              <option value="Professor">Professor</option>
              <option value="Lecturer">Lecturer</option>
              <option value="HOD">HOD</option>
            </select>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Qualification</label>
            <select id="m-fac-qual" class="form-select">
              <option value="" disabled selected>Select Qualification ▼</option>
              <option value="B.Tech">B.Tech</option>
              <option value="M.Tech">M.Tech</option>
              <option value="Ph.D.">Ph.D.</option>
              <option value="M.Sc.">M.Sc.</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Specialization</label>
            <select id="m-fac-spec" class="form-select">
              <option value="" disabled selected>Select Specialization ▼</option>
              <option value="Computer Networks">Computer Networks</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Data Science">Data Science</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Status</label>
          <select id="m-fac-status" class="form-select">
            <option value="ACTIVE" selected>Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </form>
    `;

    UIService.openModal("Add Staff Member", html, [
      { text: "Cancel", className: "btn-secondary", onClick: () => UIService.closeModal() },
      { text: "Add Staff", className: "btn-primary", onClick: () => this.saveNewFaculty() }
    ]);
    
    setTimeout(() => {
      if(window.lucide) window.lucide.createIcons();
    }, 10);
  },

  updateGeneratedEmail() {
    const fName = document.getElementById('m-fac-fname')?.value || "";
    const lName = document.getElementById('m-fac-lname')?.value || "";
    const generated = facultyService.generateOfficialEmail(fName, lName);
    const emailField = document.getElementById('m-fac-email');
    if(emailField) emailField.value = generated;
  },

  onDesignationChange(designation, mode) {
    const roleDisplay = mode === 'add' ? document.getElementById('m-fac-role-display') : document.getElementById('m-edit-fac-role-display');
    const roleVal = mode === 'add' ? document.getElementById('m-fac-role-val') : document.getElementById('m-edit-fac-role-val');
    
    let newRole = 'FACULTY';
    if (designation === 'Librarian') {
      newRole = 'LIBRARIAN';
    } else if (designation === 'Lab Assistant') {
      newRole = 'LAB_ASSISTANT';
    }
    
    if (roleDisplay) roleDisplay.value = newRole;
    if (roleVal) roleVal.value = newRole;
  },

  async saveNewFaculty() {
    const fname = document.getElementById('m-fac-fname').value.trim();
    const lname = document.getElementById('m-fac-lname').value.trim();
    const name = fname + (lname ? ' ' + lname : '');
    const selectedRole = document.getElementById('m-fac-role-val').value;

    const data = {
      name: name,
      employeeId: document.getElementById('m-fac-empid').value,
      email: document.getElementById('m-fac-email').value,
      phone: document.getElementById('m-fac-phone').value,
      department: document.getElementById('m-fac-dept').value,
      designation: document.getElementById('m-fac-designation').value,
      qualification: document.getElementById('m-fac-qual').value,
      specialization: document.getElementById('m-fac-spec').value,
      status: document.getElementById('m-fac-status').value,
      staffRole: selectedRole
    };

    if(!fname || !lname || !data.department || !data.designation || !data.employeeId) {
      UIService.showToast("Please complete all required fields.", "warning");
      return;
    }

    try {
      await facultyService.addFaculty(data);
      UIService.closeModal();
      const roleLabel = AuthorizationService.getRoleDisplayName(selectedRole);
      UIService.showToast(`${roleLabel} added successfully.`, "success");
    } catch (err) {
      UIService.showToast(err.message, "danger");
    }
  },

  async openEditModal(docId) {
    let fac;
    try {
      fac = await facultyService.getFacultyById(docId);
    } catch (err) {
      UIService.showToast(err.message, "danger");
      return;
    }
    if (!fac) {
      UIService.showToast("Faculty member not found.", "danger");
      return;
    }

    const depts = departmentService.getDepartments();

    const html = `
      <form id="edit-fac-form" onsubmit="return false;">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" id="m-edit-fac-name" class="form-input" value="${fac.name || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">System Role</label>
          <input type="text" id="m-edit-fac-role-display" class="form-input" value="${fac.role || fac.staffRole || 'FACULTY'}" readonly style="background-color: var(--color-bg-main); font-weight: 600; color: var(--color-text-muted);">
          <input type="hidden" id="m-edit-fac-role-val" value="${fac.role || fac.staffRole || 'FACULTY'}">
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Employee ID (Read-only)</label>
            <input type="text" class="form-input" value="${fac.employeeId || ''}" disabled>
          </div>
          <div class="form-group">
            <label class="form-label">Email (Read-only)</label>
            <input type="text" class="form-input" value="${fac.email || ''}" disabled>
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Department</label>
            <select id="m-edit-fac-dept" class="form-select">
              ${depts.map(d => `<option value="${d.name}" ${fac.department === d.name ? 'selected' : ''}>${d.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Designation</label>
            <select id="m-edit-fac-designation" class="form-select" onchange="FacultyView.onDesignationChange(this.value, 'edit')">
              ${['Assistant Professor','Associate Professor','Professor','Lecturer','HOD','Librarian'].map(d => `<option value="${d}" ${fac.designation === d ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Qualification</label>
            <select id="m-edit-fac-qual" class="form-select">
              ${['B.Tech','M.Tech','Ph.D.','M.Sc.'].map(q => `<option value="${q}" ${fac.qualification === q ? 'selected' : ''}>${q}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Specialization</label>
            <input type="text" id="m-edit-fac-spec" class="form-input" value="${fac.specialization || ''}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Phone</label>
          <input type="tel" id="m-edit-fac-phone" class="form-input" value="${fac.phone || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select id="m-edit-fac-status" class="form-select">
            <option value="ACTIVE" ${fac.status === 'ACTIVE' ? 'selected' : ''}>Active</option>
            <option value="INACTIVE" ${fac.status === 'INACTIVE' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      </form>
    `;

    UIService.openModal("Edit Staff Member", html, [
      { text: "Cancel", className: "btn-secondary", onClick: () => UIService.closeModal() },
      { text: "Update Faculty", className: "btn-primary", onClick: async () => {
        try {
          await facultyService.updateFaculty(docId, {
            name: document.getElementById('m-edit-fac-name').value.trim(),
            department: document.getElementById('m-edit-fac-dept').value,
            designation: document.getElementById('m-edit-fac-designation').value,
            role: document.getElementById('m-edit-fac-role-val').value,
            qualification: document.getElementById('m-edit-fac-qual').value,
            specialization: document.getElementById('m-edit-fac-spec').value,
            phone: document.getElementById('m-edit-fac-phone').value.trim(),
            status: document.getElementById('m-edit-fac-status').value
          });
          UIService.closeModal();
          UIService.showToast("Staff member updated successfully.", "success");
        } catch (e) {
          UIService.showToast(e.message, "danger");
        }
      }}
    ]);
  },

  deleteFaculty(docId) {
    UIService.showConfirm("Delete Staff Member?", "Are you sure you want to delete this staff member?", async () => {
      try {
        await facultyService.deleteFaculty(docId);
        UIService.showToast("Staff member deleted successfully.", "success");
      } catch (err) {
        UIService.showToast(err.message, "danger");
      }
    });
  }
};

window.FacultyView = FacultyView;


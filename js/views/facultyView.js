/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - FACULTY MANAGEMENT (FIRESTORE CONNECTED)
   Bidirectional: Firestore ↔ GUI with real-time listeners.
   ========================================================================== */

const FacultyView = {
  _cachedFaculty: [],
  _depts: [],
  _lastDoc: null,
  _hasMore: false,
  _isLoading: false,

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
        <table class="data-table" id="faculty-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Designation</th>
              <th>Department</th>
              <th>Status</th>
              <th style="width: 50px;"></th>
            </tr>
          </thead>
          <tbody id="faculty-table-body">
            <tr><td colspan="8" style="text-align:center;"><div class="skeleton" style="height:36px; margin: 10px;"></div></td></tr>
          </tbody>
        </table>
        <div id="faculty-load-more-container" style="text-align:center; padding:1rem; display:none;">
          <button id="faculty-load-more-btn" class="btn-secondary" onclick="FacultyView.loadFaculty(true)">Load More</button>
        </div>
      </div>

      <!-- VIEW DETAILS DRAWER -->
      <div class="drawer-overlay" id="faculty-details-drawer" onclick="if(event.target===this) FacultyView.closeDetailsDrawer()">
        <div class="drawer-panel">
          <div class="drawer-header">
            <h3 class="drawer-title">Staff Profile</h3>
            <button class="btn-close" onclick="FacultyView.closeDetailsDrawer()"><i data-lucide="x"></i></button>
          </div>
          <div class="drawer-body" id="faculty-details-content">
          </div>
          <div class="drawer-footer">
            <button class="btn-secondary" onclick="FacultyView.closeDetailsDrawer()">Close</button>
          </div>
        </div>
      </div>
    `;
  },

  afterRender() {
    this.loadFaculty(false);
  },

  async loadFaculty(isLoadMore = false) {
    if (this._isLoading) return;
    this._isLoading = true;

    const tbody = document.getElementById('faculty-table-body');
    const loadMoreBtn = document.getElementById('faculty-load-more-btn');
    const loadMoreContainer = document.getElementById('faculty-load-more-container');

    if (!isLoadMore) {
      this._lastDoc = null;
      this._cachedFaculty = [];
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align:center;">
              <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.5rem;">
                <i data-lucide="loader" class="spin" style="width:28px; height:28px; color:var(--color-primary);"></i>
                <span style="color:var(--color-text-muted); font-weight:600;">Loading Staff...</span>
              </div>
            </td>
          </tr>
        `;
        if (window.lucide) window.lucide.createIcons();
      }
      if (loadMoreContainer) loadMoreContainer.style.display = 'none';
    } else {
      if (loadMoreBtn) loadMoreBtn.innerHTML = `<i data-lucide="loader" class="spin" style="width:16px; height:16px;"></i> Loading...`;
    }

    try {
      const result = await facultyService.loadFaculty(this._lastDoc, 50);
      this._lastDoc = result.lastDoc;
      this._hasMore = result.hasMore;

      if (!isLoadMore) {
        this._cachedFaculty = result.facultyList || [];
      } else {
        this._cachedFaculty = [...this._cachedFaculty, ...(result.facultyList || [])];
      }

      this._renderTableRows(this._cachedFaculty);

      if (loadMoreContainer) {
        loadMoreContainer.style.display = this._hasMore ? 'block' : 'none';
      }
      if (loadMoreBtn) {
        loadMoreBtn.innerHTML = `Load More`;
      }
    } catch (err) {
      if (!isLoadMore && tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align:center;">
              <div style="display:flex; flex-direction:column; align-items:center; gap:0.75rem;">
                <i data-lucide="alert-circle" style="width:32px; height:32px;"></i>
                <div>
                  <strong>Unable to load staff records</strong>
                  <div style="font-size:0.85rem; color:var(--color-text-muted); margin-top:0.25rem;">${err.message || "Please check your network connection."}</div>
                </div>
                <button class="btn-primary" onclick="FacultyView.loadFaculty(false)" style="margin-top:0.5rem;">
                  <i data-lucide="refresh-cw"></i> Retry
                </button>
              </div>
            </td>
          </tr>
        `;
        if (window.lucide) window.lucide.createIcons();
      } else {
        UIService.showToast(err.message, "danger");
        if (loadMoreBtn) loadMoreBtn.innerHTML = `Load More`;
      }
    } finally {
      this._isLoading = false;
    }
  },

  _renderTableRows(faculty) {
    const tbody = document.getElementById('faculty-table-body');
    if (!tbody) return;

    if (faculty.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No staff members found.</td></tr>';
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
            <div class="action-menu-container">
              <button class="btn-icon" onclick="FacultyView.toggleActionMenu('${f.id}', event)">
                <i data-lucide="more-vertical"></i>
              </button>
              <div class="action-menu-dropdown" id="action-menu-${f.id}">
                <button class="action-menu-item" onclick="FacultyView.openDetailsDrawer('${f.id}')">
                  <i data-lucide="eye" style="width:16px;"></i> View Details
                </button>
                <button class="action-menu-item" onclick="FacultyView.openEditModal('${f.id}')">
                  <i data-lucide="edit-2" style="width:16px;"></i> Edit Profile
                </button>
                <button class="action-menu-item danger" onclick="FacultyView.deleteFaculty('${f.id}')">
                  <i data-lucide="trash-2" style="width:16px;"></i> Delete Record
                </button>
              </div>
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
    const depts = this._depts || [];
    const subjects = subjectService.getSubjects();
    
    const html = `
      <form id="add-fac-form" onsubmit="return false;">
        <div class="form-section">
          <div class="form-section-title">Personal Information</div>
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
            <label class="form-label">Phone Number</label>
            <input type="tel" id="m-fac-phone" class="form-input" placeholder="+91 9876543210">
          </div>
        </div>

        <div class="form-section">
          <div class="form-section-title">Professional Information</div>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Employee / Faculty ID *</label>
              <input type="text" id="m-fac-empid" class="form-input" placeholder="e.g. EMP-FAC-103" required>
            </div>
            <div class="form-group">
              <label class="form-label">Department *</label>
              <select id="m-fac-dept" class="form-select">
                <option value="" disabled selected>Select Department ▼</option>
                ${depts.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-grid-2">
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
            <div class="form-group">
              <label class="form-label">System Role *</label>
              <select id="m-fac-role-val" class="form-select">
                <option value="FACULTY" selected>Faculty</option>
                <option value="STUDENT">Student</option>
                <option value="LIBRARIAN">Librarian</option>
                <option value="LAB_ASSISTANT">Lab Assistant</option>
                <option value="ADMIN">Administrator</option>
                <option value="PROCTOR">Proctor</option>
                <option value="HOD">HOD</option>
                <option value="DEAN">Dean</option>
                <option value="REGISTRAR">Registrar</option>
                <option value="COE">COE</option>
                <option value="FINANCE_OFFICER">Finance Officer</option>
                <option value="IT_SUPPORT">IT Support</option>
                <option value="MANAGEMENT">Management</option>
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
        </div>

        <div class="form-section">
          <div class="form-section-title">Account Information</div>
          <div class="form-group">
            <label class="form-label">Official Faculty Email (Auto-generated)</label>
            <div style="position:relative;">
              <i data-lucide="mail" style="position:absolute; left:1rem; top:50%; transform:translateY(-50%); color:var(--color-primary); width:16px; height:16px;"></i>
              <input type="email" id="m-fac-email" class="form-input" readonly placeholder="Will be generated automatically..." style="padding-left:2.5rem; background-color: var(--color-app-bg); font-family: monospace; color: var(--color-primary); font-weight: 600;">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select id="m-fac-status" class="form-select">
              <option value="ACTIVE" selected>Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
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
      role: selectedRole
    };

    if(!fname || !lname || !data.department || !data.designation || !data.employeeId) {
      UIService.showToast("Please complete all required fields.", "warning");
      return;
    }

    try {
      const addedFac = await facultyService.addFaculty(data);
      UIService.closeModal();
      const roleLabel = AuthorizationService.getRoleDisplayName(selectedRole);
      if (addedFac.tempPassword) {
        const pwdHtml = `
          <div style="text-align:center; padding: 1rem;">
            <h2 style="margin-bottom: 1rem; color: var(--color-navy-dark);">Temporary Password</h2>
            <div style="font-family: monospace; font-size: 1.5rem; background: #F1F5F9; padding: 1rem; border-radius: 8px; font-weight: bold; color: var(--color-primary); letter-spacing: 2px;">
              ${addedFac.tempPassword}
            </div>
            <p style="margin-top: 1rem; color: var(--color-danger); font-size: 0.9rem;">The user must change this password after first login.</p>
          </div>
        `;
        UIService.openModal(`${roleLabel} Provisioned`, pwdHtml, [
          { text: "Copy & Close", className: "btn-primary", onClick: () => {
            navigator.clipboard.writeText(addedFac.tempPassword);
            UIService.closeModal();
          }}
        ]);
        UIService.showToast(`${roleLabel} added successfully.`, "success");
      } else {
        UIService.showToast(`${roleLabel} added successfully.`, "success");
      }
      this.loadFaculty(false);
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
          <select id="m-edit-fac-role-val" class="form-select">
            ${['FACULTY','STUDENT','LIBRARIAN','LAB_ASSISTANT','ADMIN','PROCTOR','HOD','DEAN','REGISTRAR','COE','FINANCE_OFFICER','IT_SUPPORT','MANAGEMENT'].map(r => `<option value="${r}" ${(fac.role || fac.staffRole || 'FACULTY') === r ? 'selected' : ''}>${r.charAt(0) + r.slice(1).toLowerCase().replace('_', ' ')}</option>`).join('')}
          </select>
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
          this.loadFaculty(false);
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
        this.loadFaculty(false);
      } catch (err) {
        UIService.showToast(err.message, "danger");
      }
    });
  },

  toggleActionMenu(id, e) {
    e.stopPropagation();
    document.querySelectorAll('.action-menu-dropdown').forEach(d => d.classList.remove('active'));
    const menu = document.getElementById(`action-menu-${id}`);
    if (menu) menu.classList.toggle('active');
  },

  openDetailsDrawer(id) {
    document.querySelectorAll('.action-menu-dropdown').forEach(d => d.classList.remove('active'));
    const f = this._cachedFaculty.find(x => x.id === id);
    if (!f) return;

    document.getElementById('faculty-details-content').innerHTML = `
      <div style="text-align: center; margin-bottom: 2rem;">
        <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--color-accent); color: #FFF; font-size: 2rem; font-weight: 700; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem auto;">
          ${(f.name || 'U').charAt(0).toUpperCase()}
        </div>
        <h4 style="font-size: 1.25rem; font-weight: 700; color: var(--color-navy-dark); margin: 0;">${f.name || 'N/A'}</h4>
        <div style="font-size: 0.85rem; color: var(--color-text-muted);">${f.email || 'N/A'}</div>
      </div>

      <div style="margin-bottom: 2rem;">
        <h4 style="margin-bottom: 1rem; color: var(--color-primary); border-bottom: 1px solid #E2E8F0; padding-bottom: 0.5rem;">Employment Profile</h4>
        <div class="detail-group"><div class="detail-label">Employee ID</div><div class="detail-value">${f.employeeId || 'N/A'}</div></div>
        <div class="detail-group"><div class="detail-label">Department</div><div class="detail-value">${f.department || 'N/A'}</div></div>
        <div class="detail-group"><div class="detail-label">Designation</div><div class="detail-value">${f.designation || 'N/A'}</div></div>
        <div class="detail-group"><div class="detail-label">System Role</div><div class="detail-value">${AuthorizationService.getRoleDisplayName(f.role || 'FACULTY')}</div></div>
      </div>
      
      <div style="margin-bottom: 2rem;">
        <h4 style="margin-bottom: 1rem; color: var(--color-primary); border-bottom: 1px solid #E2E8F0; padding-bottom: 0.5rem;">Qualifications</h4>
        <div class="detail-group"><div class="detail-label">Highest Degree</div><div class="detail-value">${f.qualification || 'N/A'}</div></div>
        <div class="detail-group"><div class="detail-label">Specialization</div><div class="detail-value">${f.specialization || 'N/A'}</div></div>
      </div>

      <div>
        <h4 style="margin-bottom: 1rem; color: var(--color-primary); border-bottom: 1px solid #E2E8F0; padding-bottom: 0.5rem;">Contact & Status</h4>
        <div class="detail-group"><div class="detail-label">Phone</div><div class="detail-value">${f.phone || 'N/A'}</div></div>
        <div class="detail-group">
          <div class="detail-label">Account Status</div>
          <div class="detail-value"><span class="status-badge ${f.status === 'ACTIVE' ? 'present' : 'absent'}">${f.status || 'N/A'}</span></div>
        </div>
      </div>
    `;

    document.getElementById('faculty-details-drawer').classList.add('active');
  },
  
  closeDetailsDrawer() {
    document.getElementById('faculty-details-drawer').classList.remove('active');
  }
};

document.addEventListener('click', (e) => {
  if(!e.target.closest('.action-menu-container')) {
    document.querySelectorAll('.action-menu-dropdown').forEach(d => d.classList.remove('active'));
  }
});

window.FacultyView = FacultyView;

/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - ADMIN MANAGEMENT (FIRESTORE CONNECTED)
   Bidirectional: Firestore ↔ GUI with real-time listeners.
   ========================================================================== */

const AdminManagementView = {
  _cachedAdmins: [],

  render() {
    return `
      <div class="page-header">
        <h1>User Management</h1>
        <p>Manage all users and their access credentials.</p>
      </div>

      <div class="toolbar">
        <div class="filter-group">
          <input type="text" class="search-input" style="width:240px; background:white;" placeholder="Search user name, email..." onkeyup="AdminManagementView.onSearch(this.value)">
        </div>

        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          <button class="btn-primary" onclick="AdminManagementView.openAddModal()">
            <i data-lucide="shield-plus"></i> Provision New User
          </button>
        </div>
      </div>

      <div class="table-container">
        <table class="custom-table" id="admin-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Official Email</th>
              <th>Status</th>
              <th>System Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="admin-table-body">
            <tr><td colspan="5" style="text-align:center; padding:2rem;"><i data-lucide="loader" class="spin"></i> Loading Users...</td></tr>
          </tbody>
        </table>
      </div>
    `;
  },

  afterRender() {
    adminService.listenToUsers((err, admins) => {
      const tbody = document.getElementById('admin-table-body');
      if (!tbody) return;

      if (err) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--color-danger);">${err.message}</td></tr>`;
        return;
      }

      this._cachedAdmins = admins;
      this._renderTableRows(admins);
    });
  },

  _renderTableRows(admins) {
    const tbody = document.getElementById('admin-table-body');
    if (!tbody) return;

    if (admins.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--color-text-muted);">No system users found.</td></tr>';
    } else {
      tbody.innerHTML = admins.map(a => `
        <tr>
          <td><div style="font-weight:600; color:var(--color-navy-dark);">${a.name || 'N/A'}</div></td>
          <td>${a.email || a.id}</td>
          <td><span class="status-badge ${a.status === 'ACTIVE' ? 'present' : 'absent'}">${a.status || 'N/A'}</span></td>
          <td><span class="role-badge ${(a.role || 'user').toLowerCase()}">${(a.role || 'USER').toUpperCase()}</span></td>
          <td>
            <div class="action-btns">
              <button class="btn-icon-sm" onclick="AdminManagementView.openEditModal('${a.id}')" title="Edit"><i data-lucide="edit-2"></i></button>
              <button class="btn-icon-sm danger" onclick="AdminManagementView.toggleStatus('${a.id}', '${a.status}')" title="${a.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}"><i data-lucide="power"></i></button>
            </div>
          </td>
        </tr>
      `).join('');
    }
    if (window.lucide) window.lucide.createIcons();
  },

  onSearch(query) {
    const q = (query || '').toLowerCase();
    if (!q) {
      this._renderTableRows(this._cachedAdmins);
      return;
    }
    const filtered = this._cachedAdmins.filter(a =>
      (a.name || '').toLowerCase().includes(q) ||
      (a.email || a.id || '').toLowerCase().includes(q)
    );
    this._renderTableRows(filtered);
  },

  openAddModal() {
    const html = `
      <form id="add-admin-form" onsubmit="return false;">
        <div class="form-group">
          <label class="form-label">Full Name *</label>
          <input type="text" id="m-admin-name" class="form-input" placeholder="e.g. John Doe" required>
        </div>

        <div class="form-group">
          <label class="form-label">Official Email Address *</label>
          <div class="input-container">
            <i data-lucide="mail" class="input-icon"></i>
            <input type="email" id="m-admin-email" class="form-input" placeholder="name@poornima.org" required>
          </div>
          <p style="font-size: 0.75rem; color: #64748B; margin-top: 4px;">Must be a valid @poornima.org email address.</p>
        </div>

        <div class="form-group">
          <label class="form-label">System Role *</label>
          <div class="input-container">
            <i data-lucide="shield" class="input-icon"></i>
            <select id="m-admin-role" class="form-input" required>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="proctor">Proctor</option>
              <option value="hod">HOD</option>
              <option value="dean">Dean</option>
              <option value="registrar">Registrar</option>
              <option value="coe">COE</option>
              <option value="librarian">Librarian</option>
              <option value="finance_officer">Finance Officer</option>
              <option value="admin">Administrator</option>
              <option value="it_support">IT Support</option>
              <option value="management">Management</option>
            </select>
          </div>
        </div>
      </form>
    `;

    UIService.openModal("Provision System User", html, [
      { text: "Cancel", className: "btn-secondary", onClick: () => UIService.closeModal() },
      { text: "Provision User", className: "btn-primary", onClick: async () => {
        const name = document.getElementById('m-admin-name').value;
        const email = document.getElementById('m-admin-email').value;
        const role = document.getElementById('m-admin-role').value;

        try {
          await window.adminService.addUser({ name, email, role });
          UIService.closeModal();
          UIService.showToast("User provisioned successfully. Temporary password is: password123", "success");
        } catch (err) {
          UIService.showToast(err.message, "danger");
        }
      }}
    ]);

    setTimeout(() => {
      if(window.lucide) window.lucide.createIcons();
    }, 10);
  },

  async openEditModal(docId) {
    let admin;
    try {
      admin = await adminService.getUserById(docId);
    } catch (err) {
      UIService.showToast(err.message, "danger");
      return;
    }
    if (!admin) {
      UIService.showToast("User not found.", "danger");
      return;
    }

    const html = `
      <form id="edit-admin-form" onsubmit="return false;">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" id="m-edit-admin-name" class="form-input" value="${admin.name || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Email (Read-only)</label>
          <input type="text" class="form-input" value="${admin.email || admin.id}" disabled>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select id="m-edit-admin-status" class="form-select">
            <option value="ACTIVE" ${admin.status === 'ACTIVE' ? 'selected' : ''}>Active</option>
            <option value="INACTIVE" ${admin.status === 'INACTIVE' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      </form>
    `;

    UIService.openModal("Edit Admin", html, [
      { text: "Cancel", className: "btn-secondary", onClick: () => UIService.closeModal() },
      { text: "Update Admin", className: "btn-primary", onClick: async () => {
        try {
          await adminService.updateUser(docId, {
            name: document.getElementById('m-edit-admin-name').value.trim(),
            status: document.getElementById('m-edit-admin-status').value
          });
          UIService.closeModal();
          UIService.showToast("Admin updated successfully.", "success");
        } catch (e) {
          UIService.showToast(e.message, "danger");
        }
      }}
    ]);
  },

  toggleStatus(docId, currentStatus) {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const action = newStatus === 'INACTIVE' ? 'deactivate' : 'activate';

    UIService.showConfirm(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Admin?`,
      `Are you sure you want to ${action} this admin account?`,
      async () => {
        try {
          await adminService.updateUserStatus(docId, newStatus);
          UIService.showToast(`Admin account ${action}d.`, "success");
        } catch (err) {
          UIService.showToast(err.message, "danger");
        }
      }
    );
  }
};

window.AdminManagementView = AdminManagementView;


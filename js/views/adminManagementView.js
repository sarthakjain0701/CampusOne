/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - ADMIN & USER MANAGEMENT (FIRESTORE CONNECTED)
   Unified User Management across all roles with robust error handling & retry
   ========================================================================== */

const AdminManagementView = {
  _cachedAdmins: [],
  _activeRoleFilter: 'ALL',
  _activeStatusFilter: 'ALL',
  _searchQuery: '',
  _isLoading: true,
  _lastDocs: null,
  _hasMore: false,

  render() {
    return `
      <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div>
          <h1>User Management</h1>
          <p>Manage all users, roles, and access credentials across the institution.</p>
        </div>
        <button class="btn-primary" onclick="AdminManagementView.openAddModal()">
          <i data-lucide="shield-plus"></i> Provision New User
        </button>
      </div>

      <div class="toolbar">
        <div class="filter-group" style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
          <input type="text" id="admin-user-search" class="search-input" style="width:240px; background:white;" placeholder="Search user name, email..." onkeyup="AdminManagementView.onSearch(this.value)" value="${this._searchQuery}">
          
          <select id="admin-role-filter" class="form-select" onchange="AdminManagementView.onRoleFilter(this.value)">
            <option value="ALL" ${this._activeRoleFilter === 'ALL' ? 'selected' : ''}>All Roles</option>
            <option value="ADMIN" ${this._activeRoleFilter === 'ADMIN' ? 'selected' : ''}>Administrator</option>
            <option value="FACULTY" ${this._activeRoleFilter === 'FACULTY' ? 'selected' : ''}>Faculty</option>
            <option value="LAB_ASSISTANT" ${this._activeRoleFilter === 'LAB_ASSISTANT' ? 'selected' : ''}>Lab Assistant</option>
            <option value="LIBRARIAN" ${this._activeRoleFilter === 'LIBRARIAN' ? 'selected' : ''}>Librarian</option>
            <option value="STUDENT" ${this._activeRoleFilter === 'STUDENT' ? 'selected' : ''}>Student</option>
          </select>

          <select id="admin-status-filter" class="form-select" onchange="AdminManagementView.onStatusFilter(this.value)">
            <option value="ALL" ${this._activeStatusFilter === 'ALL' ? 'selected' : ''}>All Status</option>
            <option value="ACTIVE" ${this._activeStatusFilter === 'ACTIVE' ? 'selected' : ''}>Active Only</option>
            <option value="INACTIVE" ${this._activeStatusFilter === 'INACTIVE' ? 'selected' : ''}>Inactive Only</option>
          </select>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table" id="admin-table">
          <thead>
            <tr>
              <th>User Info</th>
              <th>Official Email</th>
              <th>System Role</th>
              <th>Status</th>
              <th style="width:50px;"></th>
            </tr>
          </thead>
          <tbody id="admin-table-body">
            <tr>
              <td colspan="5" style="text-align:center;">
                <div class="skeleton" style="height:36px; margin: 10px;"></div>
              </td>
            </tr>
          </tbody>
        </table>
        <div id="admin-load-more-container" style="text-align:center; padding:1rem; display:none;">
          <button id="admin-load-more-btn" class="btn-secondary" onclick="AdminManagementView.loadUsers(false, true)">Load More</button>
        </div>
      </div>
    `;
  },

  afterRender() {
    this._isLoading = true;
    this.loadUsers(true, false);
  },

  async loadUsers(forceRefresh = false, isLoadMore = false) {
    const tbody = document.getElementById('admin-table-body');
    const loadMoreBtn = document.getElementById('admin-load-more-btn');
    const loadMoreContainer = document.getElementById('admin-load-more-container');

    if (!tbody) return;

    if (!isLoadMore) {
      this._lastDocs = null;
      this._cachedAdmins = [];
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;">
            <div class="skeleton" style="height:36px; margin: 10px;"></div>
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      if (loadMoreContainer) loadMoreContainer.style.display = 'none';
    } else {
      if (loadMoreBtn) loadMoreBtn.innerHTML = `<i data-lucide="loader" class="spin" style="width:16px; height:16px;"></i> Loading...`;
    }

    try {
      const result = await adminService.getUsers({
        forceRefresh,
        limit: 50,
        lastDocs: this._lastDocs,
        roleFilter: this._activeRoleFilter
      });
      
      this._isLoading = false;
      this._lastDocs = result.lastDocs;
      this._hasMore = result.hasMore;

      if (!isLoadMore) {
        this._cachedAdmins = result.users || [];
      } else {
        this._cachedAdmins = [...this._cachedAdmins, ...(result.users || [])];
      }
      
      this._applyFiltersAndRender();

      if (loadMoreContainer) {
        loadMoreContainer.style.display = this._hasMore ? 'block' : 'none';
      }
      if (loadMoreBtn) {
        loadMoreBtn.innerHTML = `Load More`;
      }

    } catch (err) {
      this._isLoading = false;
      if (!isLoadMore) {
        const currentTbody = document.getElementById('admin-table-body');
        if (!currentTbody) return;
        currentTbody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align:center;">
              <div style="display:flex; flex-direction:column; align-items:center; gap:0.75rem;">
                <i data-lucide="alert-circle" style="width:32px; height:32px;"></i>
                <div>
                  <strong>Unable to load user records</strong>
                  <div style="font-size:0.85rem; color:var(--color-text-muted); margin-top:0.25rem;">${err.message || "Please check your network connection."}</div>
                </div>
                <button class="btn-primary" onclick="AdminManagementView.loadUsers(true)" style="margin-top:0.5rem;">
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
    }
  },

  _applyFiltersAndRender() {
    let filtered = [...this._cachedAdmins];

    // Search query filter
    if (this._searchQuery) {
      const q = this._searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || u.id || '').toLowerCase().includes(q) ||
        (u.employeeId || '').toLowerCase().includes(q) ||
        (u.rollNumber || '').toLowerCase().includes(q)
      );
    }

    // Role filter
    if (this._activeRoleFilter !== 'ALL') {
      filtered = filtered.filter(u => (u.role || '').toUpperCase() === this._activeRoleFilter);
    }

    // Status filter
    if (this._activeStatusFilter !== 'ALL') {
      filtered = filtered.filter(u => (u.status || 'ACTIVE').toUpperCase() === this._activeStatusFilter);
    }

    this._renderTableRows(filtered);
  },

  _renderTableRows(users) {
    const tbody = document.getElementById('admin-table-body');
    if (!tbody) return;

    if (users.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;">
            <div style="display:flex; flex-direction:column; align-items:center; gap:0.5rem;">
              <i data-lucide="users" style="width:36px; height:36px; color:#CBD5E1;"></i>
              <strong style="font-size:1rem; color:var(--color-navy-dark);">No users found</strong>
              <span style="font-size:0.85rem;">No matching user records match your filter criteria.</span>
            </div>
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = users.map(a => {
        const role = (a.role || 'USER').toUpperCase();
        const roleBadgeClass = role.toLowerCase().replace('_', '-');
        const roleLabel = window.AuthorizationService ? AuthorizationService.getRoleDisplayName(role) : role;
        const isActive = (a.status || 'ACTIVE').toUpperCase() === 'ACTIVE';

        return `
          <tr>
            <td>
              <div style="font-weight:600; color:var(--color-navy-dark);">${a.name || 'N/A'}</div>
              ${a.department ? `<div style="font-size:0.75rem; color:var(--color-text-muted);">${a.department}</div>` : ''}
            </td>
            <td>
              <span style="font-family:monospace; font-size:0.85rem; font-weight:700; color:var(--color-navy-dark);">${a.email || a.id}</span>
            </td>
            <td><span class="role-badge ${roleBadgeClass}">${roleLabel}</span></td>
            <td><span class="status-badge ${isActive ? 'present' : 'absent'}">${isActive ? 'ACTIVE' : 'INACTIVE'}</span></td>
            <td>
              <div class="action-menu-container">
                <button class="btn-icon" onclick="AdminManagementView.toggleActionMenu('${a.id}', event)">
                  <i data-lucide="more-vertical"></i>
                </button>
                <div class="action-menu-dropdown" id="action-menu-${a.id}">
                  <button class="action-menu-item" onclick="AdminManagementView.openEditModal('${a.id}')">
                    <i data-lucide="edit-2" style="width:16px;"></i> Edit Profile
                  </button>
                  <button class="action-menu-item ${isActive ? 'danger' : ''}" onclick="AdminManagementView.toggleStatus('${a.id}', '${a.status || 'ACTIVE'}')">
                    <i data-lucide="power" style="width:16px;"></i> ${isActive ? 'Deactivate' : 'Activate'}
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

  toggleActionMenu(id, e) {
    e.stopPropagation();
    document.querySelectorAll('.action-menu-dropdown').forEach(d => d.classList.remove('active'));
    const menu = document.getElementById(`action-menu-${id}`);
    if (menu) menu.classList.toggle('active');
  },

  onSearch(query) {
    this._searchQuery = (query || '').trim();
    this._applyFiltersAndRender();
  },

  onRoleFilter(role) {
    this._activeRoleFilter = role || 'ALL';
    this._applyFiltersAndRender();
  },

  onStatusFilter(status) {
    this._activeStatusFilter = status || 'ALL';
    this._applyFiltersAndRender();
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
              <option value="lab_assistant">Lab Assistant</option>
              <option value="librarian">Librarian</option>
              <option value="admin">Administrator</option>
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
          const addedUser = await window.adminService.addUser({ name, email, role });
          UIService.closeModal();
          if (addedUser.tempPassword) {
            const pwdHtml = `
              <div style="text-align:center; padding: 1rem;">
                <h2 style="margin-bottom: 1rem; color: var(--color-navy-dark);">Temporary Password</h2>
                <div style="font-family: monospace; font-size: 1.5rem; background: #F1F5F9; padding: 1rem; border-radius: 8px; font-weight: bold; color: var(--color-primary); letter-spacing: 2px;">
                  ${addedUser.tempPassword}
                </div>
                <p style="margin-top: 1rem; color: var(--color-danger); font-size: 0.9rem;">The user must change this password after first login.</p>
              </div>
            `;
            UIService.openModal("User Provisioned", pwdHtml, [
              { text: "Copy & Close", className: "btn-primary", onClick: () => {
                navigator.clipboard.writeText(addedUser.tempPassword);
                UIService.closeModal();
              }}
            ]);
            UIService.showToast("User provisioned successfully.", "success");
          } else {
            UIService.showToast("User provisioned successfully.", "success");
          }
          this.loadUsers(true);
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
    let user;
    try {
      user = await adminService.getUserById(docId);
    } catch (err) {
      UIService.showToast(err.message, "danger");
      return;
    }
    if (!user) {
      UIService.showToast("User record not found.", "danger");
      return;
    }

    const currentStatus = (user.status || 'ACTIVE').toUpperCase();

    const html = `
      <form id="edit-admin-form" onsubmit="return false;">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" id="m-edit-admin-name" class="form-input" value="${user.name || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Email (Read-only)</label>
          <input type="text" class="form-input" value="${user.email || user.id}" disabled style="background:#F1F5F9;">
        </div>
        <div class="form-group">
          <label class="form-label">System Role</label>
          <input type="text" class="form-input" value="${(user.role || 'USER').toUpperCase()}" disabled style="background:#F1F5F9;">
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select id="m-edit-admin-status" class="form-select">
            <option value="ACTIVE" ${currentStatus === 'ACTIVE' ? 'selected' : ''}>Active</option>
            <option value="INACTIVE" ${currentStatus === 'INACTIVE' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      </form>
    `;

    UIService.openModal("Edit User Account", html, [
      { text: "Cancel", className: "btn-secondary", onClick: () => UIService.closeModal() },
      { text: "Update User", className: "btn-primary", onClick: async () => {
        try {
          await adminService.updateUser(docId, {
            name: document.getElementById('m-edit-admin-name').value.trim(),
            status: document.getElementById('m-edit-admin-status').value
          });
          UIService.closeModal();
          UIService.showToast("User updated successfully.", "success");
          this.loadUsers(true);
        } catch (e) {
          UIService.showToast(e.message, "danger");
        }
      }}
    ]);
  },

  toggleStatus(docId, currentStatus) {
    const isCurrentlyActive = (currentStatus || 'ACTIVE').toUpperCase() === 'ACTIVE';
    const newStatus = isCurrentlyActive ? 'INACTIVE' : 'ACTIVE';
    const action = isCurrentlyActive ? 'deactivate' : 'activate';

    UIService.showConfirm(
      `${action.charAt(0).toUpperCase() + action.slice(1)} User Account?`,
      `Are you sure you want to ${action} this user account?`,
      async () => {
        try {
          await adminService.updateUserStatus(docId, newStatus);
          UIService.showToast(`User account ${action}d.`, "success");
          this.loadUsers(true);
        } catch (err) {
          UIService.showToast(err.message, "danger");
        }
      }
    );
  }
};

document.addEventListener('click', (e) => {
  if(!e.target.closest('.action-menu-container')) {
    document.querySelectorAll('.action-menu-dropdown').forEach(d => d.classList.remove('active'));
  }
});

window.AdminManagementView = AdminManagementView;



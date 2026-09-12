/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - DEPARTMENT MANAGEMENT (FIRESTORE CONNECTED)
   ========================================================================== */

const DepartmentsView = {
  _departments: [],
  _isLoading: false,

  render() {
    const departments = this._departments || [];

    return `
      <div class="page-header">
        <div>
          <h1>Department Management</h1>
          <p>Configure academic departments under Poornima Group of College.</p>
        </div>
        <button class="btn-primary" onclick="DepartmentsView.openAddModal()">
          <i data-lucide="folder-plus"></i> Add Department
        </button>
      </div>

      <div class="stat-cards-grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); align-items: stretch;">
        ${this._isLoading ? '<div style="text-align:center; grid-column: 1/-1;"><i data-lucide="loader" class="spin"></i> Loading...</div>' : ''}
        ${(!this._isLoading && departments.length === 0) ? '<div style="text-align:center; grid-column: 1/-1;">No departments found.</div>' : ''}
        ${departments.map(d => `
          <div class="stat-card-compact" style="aspect-ratio: auto; padding: 1.5rem; text-align: left; align-items: flex-start; justify-content: flex-start;">
            <div style="display: flex; justify-content: space-between; width: 100%; margin-bottom: 1rem;">
              <span class="status-badge active" style="font-family: monospace;">CODE: ${d.code}</span>
              <span class="status-badge ${d.status === 'ACTIVE' ? 'present' : 'absent'}">${d.status}</span>
            </div>
            <h3 style="font-size:1.15rem; font-weight:700; color:var(--color-navy-dark); margin-bottom:0.5rem; width: 100%;">${d.name}</h3>
            <p style="font-size:0.85rem; color:var(--color-text-muted); margin-bottom:1.5rem; width: 100%;">HOD: <strong>${d.hod}</strong></p>
            <div style="display:flex; justify-content:flex-end; width: 100%; gap: 0.5rem; margin-top: auto;">
              <button class="btn-icon danger" onclick="DepartmentsView.deleteDept('${d.id}')" title="Delete"><i data-lucide="trash-2"></i></button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  async afterRender() {
    if (this._isLoading) return;
    this._isLoading = true;
    try {
      this._departments = await departmentService.getDepartmentsFromFirestore();
    } catch (e) {
      UIService.showToast("Failed to load departments.", "danger");
    } finally {
      this._isLoading = false;
      App.renderCurrentView();
    }
    if (window.lucide) window.lucide.createIcons();
  },

  openAddModal() {
    const html = `
      <form id="add-dept-form" onsubmit="return false;">
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Department Name *</label>
            <input type="text" id="m-dept-name" class="form-input" placeholder="e.g. Civil Engineering" required>
          </div>
          <div class="form-group">
            <label class="form-label">Department Code *</label>
            <input type="text" id="m-dept-code" class="form-input" placeholder="e.g. CE" required style="font-family:monospace;">
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Head of Department (HOD)</label>
            <input type="text" id="m-dept-hod" class="form-input" placeholder="e.g. Dr. S. K. Jain">
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select id="m-dept-status" class="form-select">
              <option value="ACTIVE" selected>Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </form>
    `;

    UIService.openModal("Add Department", html, [
      { text: "Cancel", className: "btn-secondary", onClick: () => UIService.closeModal() },
      { text: "Add Department", className: "btn-primary", onClick: () => this.saveDept() }
    ]);
    if (window.lucide) window.lucide.createIcons();
  },

  async saveDept() {
    const data = {
      name: document.getElementById('m-dept-name').value,
      code: document.getElementById('m-dept-code').value,
      hod: document.getElementById('m-dept-hod').value
    };

    try {
      await departmentService.addDepartment(data);
      UIService.closeModal();
      UIService.showToast("Department created successfully.", "success");
      
      this._isLoading = true;
      App.renderCurrentView();
    } catch (err) {
      UIService.showToast(err.message, "danger");
    }
  },

  deleteDept(id) {
    UIService.showConfirm("Delete Department?", "Delete this department record?", async () => {
      try {
        await departmentService.deleteDepartment(id);
        UIService.showToast("Department deleted.", "success");
        this._isLoading = true;
        App.renderCurrentView();
      } catch (err) {
        UIService.showToast(err.message, "danger");
      }
    });
  }
};

window.DepartmentsView = DepartmentsView;

const LaboratoryView = {
  loading: true,
  myLabs: [],
  selectedLab: null,
  equipment: [],
  instructions: [],
  maintenance: [],

  async afterRender() {
    this.loading = true;
    App.renderCurrentView();

    try {
      const user = authService.getCurrentUser();
      // A. My Laboratories
      this.myLabs = await LaboratoryService.getMyLaboratories(user.uid || user.id);
      
      if (this.myLabs.length > 0) {
        await this.selectLab(this.myLabs[0].id);
      } else {
        this.loading = false;
        App.renderCurrentView();
      }
    } catch (err) {
      console.error("Failed to load laboratories:", err);
      this.loading = false;
      UIService.showToast("Failed to load laboratory data", "error");
      App.renderCurrentView();
    }
  },

  async selectLab(labId) {
    this.loading = true;
    App.renderCurrentView();

    try {
      this.selectedLab = this.myLabs.find(l => l.id === labId);
      
      // Load details concurrently
      const [equip, inst, maint] = await Promise.all([
        LaboratoryService.getLabEquipment(labId),
        LaboratoryService.getLabInstructions(labId),
        LaboratoryService.getMaintenanceReports(this.selectedLab.name || this.selectedLab.roomNumber)
      ]);

      this.equipment = equip;
      this.instructions = inst;
      this.maintenance = maint;
      
    } catch (err) {
      console.error("Failed to load lab details:", err);
      UIService.showToast("Failed to load lab details", "error");
    } finally {
      this.loading = false;
      App.renderCurrentView();
    }
  },

  render() {
    if (this.loading) {
      return `
        <div class="page-header">
          <h1 class="page-title">Laboratory Management</h1>
          <p class="text-muted">Loading laboratory data...</p>
        </div>
        <div class="glass-panel" style="padding: 4rem; text-align: center;">
          <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid var(--glass-border); border-top-color: var(--role-primary); border-radius: 50%; animation: spin 1s infinite linear;"></div>
          <p style="margin-top: 1.5rem; color: var(--text-muted); font-weight: 600;">Loading...</p>
        </div>
      `;
    }

    if (this.myLabs.length === 0) {
      return `
        <div class="page-header">
          <h1 class="page-title">Laboratory Management</h1>
          <p class="text-muted">Manage your assigned laboratories</p>
        </div>
        <div class="glass-panel" style="padding: 3rem; text-align: center;">
          <i data-lucide="building" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 1rem;"></i>
          <h3 style="margin-bottom: 0.5rem; color: var(--text-primary);">No Laboratories Assigned</h3>
          <p style="color: var(--text-muted);">You currently have no laboratories assigned to you in the system.</p>
        </div>
      `;
    }

    return `
      <div class="page-header">
        <h1 class="page-title">Laboratory Management</h1>
        <p class="text-muted">Manage equipment, maintenance, and instructions</p>
      </div>

      <div style="display: grid; grid-template-columns: 280px 1fr; gap: 1.5rem;">
        
        <!-- Sidebar / Lab List -->
        <div>
          <div class="glass-panel" style="padding: 1rem;">
            <h3 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 1rem;">My Laboratories</h3>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              ${this.myLabs.map(lab => `
                <button 
                  onclick="LaboratoryView.selectLab('${lab.id}')"
                  style="
                    text-align: left; 
                    padding: 0.75rem 1rem; 
                    border-radius: 8px; 
                    border: 1px solid ${this.selectedLab?.id === lab.id ? 'var(--role-primary)' : 'transparent'};
                    background: ${this.selectedLab?.id === lab.id ? 'var(--page-background)' : 'transparent'};
                    color: ${this.selectedLab?.id === lab.id ? 'var(--role-primary)' : 'var(--text-primary)'};
                    font-weight: ${this.selectedLab?.id === lab.id ? '600' : '400'};
                    cursor: pointer;
                    transition: all 0.2s;
                  "
                >
                  <div style="font-size: 0.95rem;">${lab.name || lab.roomNumber}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${lab.department || 'General'}</div>
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Main Content Area -->
        <div>
          ${this.renderLabDetails()}
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1.5rem;">
            <!-- Equipment -->
            <div class="glass-panel" style="padding: 1.5rem;">
              <h3 style="margin-bottom: 1rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="cpu" style="width: 18px; height: 18px; color: var(--role-primary);"></i>
                Equipment Status
              </h3>
              ${this.equipment.length === 0 ? `
                <p style="color: var(--text-muted); font-size: 0.9rem;">No equipment recorded for this laboratory.</p>
              ` : `
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                  ${this.equipment.map(eq => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px;">
                      <div>
                        <div style="font-weight: 600; font-size: 0.9rem;">${eq.name}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">ID: ${eq.identificationNumber || 'N/A'} • Qty: ${eq.quantity || 1}</div>
                      </div>
                      ${this.renderStatusBadge(eq.status)}
                    </div>
                  `).join('')}
                </div>
              `}
            </div>

            <!-- Maintenance Reports -->
            <div class="glass-panel" style="padding: 1.5rem;">
              <h3 style="margin-bottom: 1rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="tool" style="width: 18px; height: 18px; color: var(--role-primary);"></i>
                Recent Maintenance
              </h3>
              ${this.maintenance.length === 0 ? `
                <p style="color: var(--text-muted); font-size: 0.9rem;">No maintenance reports found.</p>
              ` : `
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                  ${this.maintenance.slice(0, 5).map(m => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--page-background); border-radius: 8px;">
                      <div>
                        <div style="font-weight: 600; font-size: 0.85rem;">${m.title}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${m.category}</div>
                      </div>
                      <span style="font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; background: ${m.status === 'RESOLVED' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)'}; color: ${m.status === 'RESOLVED' ? 'var(--color-success)' : 'var(--color-warning)'};">${m.status}</span>
                    </div>
                  `).join('')}
                </div>
                ${this.maintenance.length > 5 ? `<div style="text-align: center; margin-top: 1rem;"><button class="btn-secondary btn-sm" onclick="App.navigateTo('my-lab-reports')">View All Reports</button></div>` : ''}
              `}
            </div>
          </div>

          <!-- Instructions -->
          <div class="glass-panel" style="padding: 1.5rem; margin-top: 1.5rem;">
            <h3 style="margin-bottom: 1rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
              <i data-lucide="clipboard-list" style="width: 18px; height: 18px; color: var(--role-primary);"></i>
              Lab Instructions & Safety
            </h3>
            ${this.instructions.length === 0 ? `
              <p style="color: var(--text-muted); font-size: 0.9rem;">No special instructions posted.</p>
            ` : `
              <ul style="padding-left: 1.5rem; color: var(--text-main); font-size: 0.95rem; line-height: 1.6;">
                ${this.instructions.map(inst => `
                  <li style="margin-bottom: 0.5rem;">
                    <strong>${inst.title}:</strong> ${inst.content}
                  </li>
                `).join('')}
              </ul>
            `}
          </div>

        </div>
      </div>
    `;
  },

  renderLabDetails() {
    if (!this.selectedLab) return '';
    return `
      <div class="glass-panel" style="padding: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">
            ${this.selectedLab.name || this.selectedLab.roomNumber || 'Unknown Lab'}
          </h2>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin: 0;">
            ${this.selectedLab.department || 'General'} Department
            ${this.selectedLab.roomNumber ? `• Room ${this.selectedLab.roomNumber}` : ''}
            ${this.selectedLab.capacity ? `• Capacity: ${this.selectedLab.capacity}` : ''}
          </p>
        </div>
      </div>
    `;
  },

  renderStatusBadge(status) {
    const s = (status || 'Available').toUpperCase();
    let bg = '#F3F4F6', color = '#4B5563';
    
    if (s === 'AVAILABLE') {
      bg = 'var(--color-success-bg)'; color = 'var(--color-success)';
    } else if (s === 'IN USE' || s === 'IN_USE') {
      bg = 'var(--color-warning-bg)'; color = 'var(--color-warning)';
    } else if (s === 'UNDER MAINTENANCE' || s === 'MAINTENANCE') {
      bg = '#FFF7ED'; color = '#EA580C';
    } else if (s === 'DAMAGED') {
      bg = 'var(--color-danger-bg)'; color = 'var(--color-danger)';
    }

    return `<span style="font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: ${bg}; color: ${color}; letter-spacing: 0.5px;">${s}</span>`;
  }
};
window.LaboratoryView = LaboratoryView;

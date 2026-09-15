/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - ADMIN LAB REPORTS VIEW
   Allows Admins to manage all laboratory problem reports.
   ========================================================================== */

const AdminLabReportsView = {
  loading: true,
  reports: [],
  selectedReport: null,
  isUpdating: false,

  afterRender() {
    if (this.loading) {
      this.fetchData();
    }
  },

  async fetchData() {
    try {
      if (typeof LabProblemService !== 'undefined') {
        LabProblemService.listenToAllReports((reports) => {
          this.reports = reports;
          if (this.loading) {
            this.loading = false;
            App.renderCurrentView();
          } else {
            if (App.currentView === 'admin-lab-reports') {
              this.renderTable();
            }
          }
        }, 200); // listen to latest 200 reports
      }
    } catch (err) {
      this.loading = false;
      console.error("Failed to load admin reports:", err);
      App.renderCurrentView();
    }
  },

  viewDetails(id) {
    this.selectedReport = this.reports.find(r => r.id === id);
    if (!this.selectedReport) return;
    
    const modalHtml = this.getModalHtml();
    let modalContainer = document.getElementById('adminReportDetailModalContainer');
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'adminReportDetailModalContainer';
      document.body.appendChild(modalContainer);
    }
    modalContainer.innerHTML = modalHtml;
    
    const modal = document.getElementById('adminReportDetailModal');
    modal.style.display = 'flex';
    void modal.offsetWidth;
    modal.style.opacity = '1';
    modal.querySelector('.modal-content').style.transform = 'translateY(0) scale(1)';
    
    if (window.lucide) window.lucide.createIcons();
  },

  closeModal() {
    const modal = document.getElementById('adminReportDetailModal');
    if (modal) {
      modal.style.opacity = '0';
      modal.querySelector('.modal-content').style.transform = 'translateY(10px) scale(0.98)';
      setTimeout(() => {
        modal.style.display = 'none';
        this.selectedReport = null;
      }, 200);
    }
  },

  async updateStatus(newStatus) {
    if (this.isUpdating || !this.selectedReport) return;
    
    if (!confirm(`Are you sure you want to change the status to ${newStatus}?`)) return;

    this.isUpdating = true;
    const user = authService.getCurrentUser();
    
    try {
      await LabProblemService.updateReportStatus(this.selectedReport.id, newStatus, user.uid || user.id, user.role);
      
      // Send notification to the reporter
      if (typeof notificationService !== 'undefined') {
        let msg = '';
        if (newStatus === 'ACKNOWLEDGED') msg = `Your ${LabProblemService.getCategoryLabel(this.selectedReport.category)} report has been acknowledged.`;
        else if (newStatus === 'IN_PROGRESS') msg = `Work is now in progress for your ${LabProblemService.getCategoryLabel(this.selectedReport.category)} issue.`;
        else if (newStatus === 'RESOLVED') msg = `Your ${LabProblemService.getCategoryLabel(this.selectedReport.category)} issue has been marked resolved.`;
        else if (newStatus === 'CLOSED') msg = `Your ${LabProblemService.getCategoryLabel(this.selectedReport.category)} report has been closed.`;

        if (msg) {
          notificationService.createNotification(
            this.selectedReport.reportedByUid,
            `Problem Report Update`,
            msg,
            'MEDIUM',
            'my-lab-reports'
          );
        }
      }

      if (typeof uiService !== 'undefined') {
        uiService.showToast('Status updated successfully.', 'success');
      }
      
      this.closeModal();
    } catch (err) {
      console.error(err);
      if (typeof uiService !== 'undefined') {
        uiService.showToast(err.message || 'Failed to update status.', 'error');
      } else {
        alert(err.message || 'Failed to update status.');
      }
    } finally {
      this.isUpdating = false;
    }
  },

  getModalHtml() {
    const report = this.selectedReport;
    const statusDetails = LabProblemService.getStatusDetails(report.status);
    const priorityDetails = LabProblemService.getPriorityDetails(report.priority);
    const dateObj = new Date(report.createdAt);
    const dateStr = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    // Status action buttons
    let actionButtons = '';
    const s = report.status;
    
    if (s === 'SUBMITTED') {
      actionButtons = `
        <button class="btn-primary" onclick="AdminLabReportsView.updateStatus('ACKNOWLEDGED')" style="background: #06B6D4;">Acknowledge</button>
      `;
    } else if (s === 'ACKNOWLEDGED') {
      actionButtons = `
        <button class="btn-primary" onclick="AdminLabReportsView.updateStatus('IN_PROGRESS')" style="background: #EA580C;">Start Work</button>
      `;
    } else if (s === 'IN_PROGRESS') {
      actionButtons = `
        <button class="btn-primary" onclick="AdminLabReportsView.updateStatus('RESOLVED')" style="background: #16A34A;">Mark Resolved</button>
      `;
    } else if (s === 'RESOLVED') {
      actionButtons = `
        <button class="btn-secondary" onclick="AdminLabReportsView.updateStatus('CLOSED')">Close Ticket</button>
      `;
    }

    return `
      <div id="adminReportDetailModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.4); z-index: 1000; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; backdrop-filter: blur(4px);">
        <div class="modal-content" style="background: white; width: 95%; max-width: 650px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); transform: translateY(10px) scale(0.98); transition: transform 0.2s; max-height: 90vh; display: flex; flex-direction: column;">
          
          <div style="padding: 1.5rem; border-bottom: 1px solid var(--color-border-light); display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; border-radius: 16px 16px 0 0;">
            <div>
              <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--color-navy-dark); margin: 0;">Manage Report</h2>
              <p style="font-size: 0.8rem; color: var(--color-text-muted); margin: 0.25rem 0 0 0;">ID: ${report.id}</p>
            </div>
            <button onclick="AdminLabReportsView.closeModal()" style="background: transparent; border: none; color: var(--color-text-light); cursor: pointer; padding: 0.5rem; border-radius: 50%;">
              <i data-lucide="x" style="width: 20px; height: 20px;"></i>
            </button>
          </div>
          
          <div style="padding: 1.5rem; overflow-y: auto;">
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; background: #F8FAFC; padding: 1.25rem; border-radius: 12px; border: 1px solid var(--color-border-light);">
              <div>
                <p style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin: 0 0 0.25rem 0;">Reported By</p>
                <p style="font-size: 0.95rem; font-weight: 600; color: var(--color-navy-dark); margin: 0;">${report.reportedByName}</p>
                <p style="font-size: 0.75rem; color: var(--color-text-light); margin: 0;">${report.reportedByEmail}</p>
              </div>
              <div>
                <p style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin: 0 0 0.25rem 0;">Laboratory / Room</p>
                <p style="font-size: 0.95rem; font-weight: 600; color: var(--color-navy-dark); margin: 0;">${report.laboratoryName}</p>
              </div>
              <div style="margin-top: 0.5rem;">
                <p style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin: 0 0 0.25rem 0;">Category</p>
                <p style="font-size: 0.95rem; font-weight: 600; color: var(--color-navy-dark); margin: 0;">${LabProblemService.getCategoryLabel(report.category)}</p>
              </div>
              <div style="margin-top: 0.5rem;">
                <p style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin: 0 0 0.25rem 0;">Priority & Status</p>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                  <span style="font-size: 0.8rem; font-weight: 700; color: ${priorityDetails.color};">${priorityDetails.label}</span>
                  <span style="color: #CBD5E1;">|</span>
                  <span style="padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; background: ${statusDetails.bg}; color: ${statusDetails.color};">
                    ${statusDetails.label}
                  </span>
                </div>
              </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
              <p style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin: 0 0 0.5rem 0;">Problem Title</p>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--color-navy-dark); margin: 0;">${report.title}</h3>
            </div>

            <div style="margin-bottom: 1.5rem;">
              <p style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin: 0 0 0.5rem 0;">Description</p>
              <div style="font-size: 0.9rem; color: var(--color-text-regular); line-height: 1.6; background: #F1F5F9; padding: 1rem; border-radius: 8px; border-left: 4px solid ${priorityDetails.color}; white-space: pre-wrap;">${report.description}</div>
            </div>

          </div>

          <div style="padding: 1.25rem 1.5rem; border-top: 1px solid var(--color-border-light); background: #F8FAFC; border-radius: 0 0 16px 16px; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 0.75rem; color: var(--color-text-light);">
              Submitted: ${dateStr}
            </div>
            <div style="display: flex; gap: 0.75rem;">
              ${actionButtons}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderTable() {
    const container = document.getElementById('adminReportsTableContainer');
    if (!container) return;

    if (this.reports.length === 0) {
      container.innerHTML = `
        <div style="padding: 4rem 2rem; text-align: center; color: var(--color-text-muted);">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: #F1F5F9; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem auto; color: #94A3B8;">
            <i data-lucide="check-circle" style="width: 32px; height: 32px;"></i>
          </div>
          <p style="font-size: 1.1rem; font-weight: 600; color: var(--color-navy-dark); margin: 0 0 0.5rem 0;">All Clear!</p>
          <p style="margin: 0; font-size: 0.95rem;">There are no laboratory problems reported.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = `
      <table class="data-table" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #F8FAFC; border-bottom: 2px solid #E2E8F0;">
            <th style="padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Problem</th>
            <th style="padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Reporter & Lab</th>
            <th style="padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Priority</th>
            <th style="padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Status</th>
            <th style="padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Date</th>
            <th style="padding: 1rem; text-align: right; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${this.reports.map(report => {
            const statusDetails = LabProblemService.getStatusDetails(report.status);
            const priorityDetails = LabProblemService.getPriorityDetails(report.priority);
            const dateObj = new Date(report.createdAt);
            const dateStr = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            
            return `
              <tr style="border-bottom: 1px solid var(--color-border-light); transition: background 0.2s;" onmouseover="this.style.background='#F8FAFC'" onmouseout="this.style.background='transparent'">
                <td style="padding: 1rem;">
                  <div style="font-size: 0.95rem; font-weight: 700; color: var(--color-navy-dark); margin-bottom: 0.15rem;">${report.title}</div>
                  <div style="font-size: 0.75rem; color: var(--color-text-light);">${LabProblemService.getCategoryLabel(report.category)}</div>
                </td>
                <td style="padding: 1rem;">
                  <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-navy-dark); margin-bottom: 0.15rem;">${report.reportedByName}</div>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted);">${report.laboratoryName}</div>
                </td>
                <td style="padding: 1rem;">
                  <span style="display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; font-weight: 700; color: ${priorityDetails.color};">
                    ${report.priority === 'URGENT' || report.priority === 'HIGH' ? '<i data-lucide="alert-triangle" style="width: 14px; height: 14px;"></i>' : ''}
                    ${priorityDetails.label}
                  </span>
                </td>
                <td style="padding: 1rem;">
                  <span style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; background: ${statusDetails.bg}; color: ${statusDetails.color}; border: 1px solid ${statusDetails.color}30;">
                    ${statusDetails.label}
                  </span>
                </td>
                <td style="padding: 1rem; font-size: 0.85rem; color: var(--color-text-muted);">${dateStr}</td>
                <td style="padding: 1rem; text-align: right;">
                  <button class="btn-secondary btn-sm" onclick="AdminLabReportsView.viewDetails('${report.id}')" style="display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; padding: 0.4rem 0.75rem;">
                    Manage <i data-lucide="chevron-right" style="width: 14px; height: 14px;"></i>
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
    if (window.lucide) window.lucide.createIcons();
  },

  render() {
    if (this.loading) {
      return `
        <div class="page-header" style="margin-bottom: 2rem;">
          <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--color-navy-dark); margin-bottom: 0.25rem;">Lab Problem Reports</h1>
          <p style="color: var(--color-text-muted); font-size: 1rem;">Manage and update laboratory maintenance tickets.</p>
        </div>
        <div class="glass-panel" style="padding: 4rem; text-align: center;">
          <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid var(--glass-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 1s infinite linear;"></div>
        </div>
      `;
    }

    setTimeout(() => this.renderTable(), 0);

    return `
      <div class="page-header" style="margin-bottom: 2rem;">
        <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--color-navy-dark); margin-bottom: 0.25rem;">Lab Problem Reports</h1>
        <p style="color: var(--color-text-muted); font-size: 1rem;">Manage and update laboratory maintenance tickets.</p>
      </div>

      <div class="glass-panel" style="padding: 0; overflow: hidden; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div id="adminReportsTableContainer" style="width: 100%; overflow-x: auto;">
          <!-- Table will be injected here -->
        </div>
      </div>
    `;
  }
};

window.AdminLabReportsView = AdminLabReportsView;

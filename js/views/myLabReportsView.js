/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - MY LAB REPORTS VIEW
   Allows Lab Assistants to view their submitted problem reports.
   ========================================================================== */

const MyLabReportsView = {
  loading: true,
  reports: [],
  selectedReport: null,

  afterRender() {
    if (this.loading) {
      this.fetchData();
    }
  },

  async fetchData() {
    try {
      const user = authService.getCurrentUser();
      
      if (typeof LabProblemService !== 'undefined') {
        LabProblemService.listenToUserReports(user.uid || user.id, (reports) => {
          this.reports = reports;
          if (this.loading) {
            this.loading = false;
            App.renderCurrentView();
          } else {
            // Re-render table only if already on this view
            if (App.currentView === 'my-lab-reports') {
              this.renderTable();
            }
          }
        });
      }
    } catch (err) {
      this.loading = false;
      console.error("Failed to load reports:", err);
      App.renderCurrentView();
    }
  },

  viewDetails(id) {
    this.selectedReport = this.reports.find(r => r.id === id);
    if (!this.selectedReport) return;
    
    // Render Modal
    const modalHtml = this.getModalHtml();
    let modalContainer = document.getElementById('reportDetailModalContainer');
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'reportDetailModalContainer';
      document.body.appendChild(modalContainer);
    }
    modalContainer.innerHTML = modalHtml;
    
    // Show Modal
    const modal = document.getElementById('reportDetailModal');
    modal.style.display = 'flex';
    // Trigger reflow for transition
    void modal.offsetWidth;
    modal.style.opacity = '1';
    modal.querySelector('.modal-content').style.transform = 'translateY(0) scale(1)';
    
    if (window.lucide) window.lucide.createIcons();
  },

  closeModal() {
    const modal = document.getElementById('reportDetailModal');
    if (modal) {
      modal.style.opacity = '0';
      modal.querySelector('.modal-content').style.transform = 'translateY(10px) scale(0.98)';
      setTimeout(() => {
        modal.style.display = 'none';
        this.selectedReport = null;
      }, 200);
    }
  },

  getModalHtml() {
    const report = this.selectedReport;
    const statusDetails = LabProblemService.getStatusDetails(report.status);
    const priorityDetails = LabProblemService.getPriorityDetails(report.priority);
    const dateObj = new Date(report.createdAt);
    const dateStr = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const updateDateObj = new Date(report.updatedAt);
    const updateStr = updateDateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Status timeline
    const allStatuses = ['SUBMITTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    const currentIdx = allStatuses.indexOf(report.status);
    
    let timelineHtml = '<div style="display: flex; justify-content: space-between; align-items: center; position: relative; margin: 2rem 0;">';
    timelineHtml += '<div style="position: absolute; top: 12px; left: 0; right: 0; height: 3px; background: #E2E8F0; z-index: 0;"></div>';
    
    allStatuses.forEach((status, idx) => {
      const isCompleted = idx <= currentIdx;
      const isCurrent = idx === currentIdx;
      const sDet = LabProblemService.getStatusDetails(status);
      
      const bgColor = isCompleted ? sDet.color : '#F1F5F9';
      const fgColor = isCompleted ? 'white' : '#94A3B8';
      const labelColor = isCurrent ? sDet.color : (isCompleted ? '#64748B' : '#CBD5E1');
      const labelWeight = isCurrent ? '800' : '600';
      
      timelineHtml += `
        <div style="display: flex; flex-direction: column; align-items: center; z-index: 1; width: 60px;">
          <div style="width: 26px; height: 26px; border-radius: 50%; background: ${bgColor}; color: ${fgColor}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 4px white; border: 2px solid ${isCompleted ? bgColor : '#E2E8F0'}; transition: all 0.3s;">
            ${isCompleted ? '<i data-lucide="check" style="width: 14px; height: 14px;"></i>' : ''}
          </div>
          <div style="margin-top: 0.5rem; font-size: 0.65rem; font-weight: ${labelWeight}; color: ${labelColor}; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">
            ${sDet.label}
          </div>
        </div>
      `;
    });
    timelineHtml += '</div>';

    return `
      <div id="reportDetailModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.4); z-index: 1000; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; backdrop-filter: blur(4px);">
        <div class="modal-content" style="background: white; width: 95%; max-width: 600px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); transform: translateY(10px) scale(0.98); transition: transform 0.2s; max-height: 90vh; display: flex; flex-direction: column;">
          
          <div style="padding: 1.5rem; border-bottom: 1px solid var(--color-border-light); display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; border-radius: 16px 16px 0 0;">
            <div>
              <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--color-navy-dark); margin: 0;">Report Details</h2>
              <p style="font-size: 0.8rem; color: var(--color-text-muted); margin: 0.25rem 0 0 0;">ID: ${report.id}</p>
            </div>
            <button onclick="MyLabReportsView.closeModal()" style="background: transparent; border: none; color: var(--color-text-light); cursor: pointer; padding: 0.5rem; border-radius: 50%; transition: background 0.2s;" onmouseover="this.style.background='#E2E8F0'; this.style.color='#1E293B';" onmouseout="this.style.background='transparent'; this.style.color='var(--color-text-light)';">
              <i data-lucide="x" style="width: 20px; height: 20px;"></i>
            </button>
          </div>
          
          <div style="padding: 1.5rem; overflow-y: auto;">
            
            ${timelineHtml}

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; background: #F8FAFC; padding: 1.25rem; border-radius: 12px;">
              <div>
                <p style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin: 0 0 0.25rem 0;">Laboratory / Room</p>
                <p style="font-size: 0.95rem; font-weight: 600; color: var(--color-navy-dark); margin: 0;">${report.laboratoryName}</p>
              </div>
              <div>
                <p style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin: 0 0 0.25rem 0;">Category</p>
                <p style="font-size: 0.95rem; font-weight: 600; color: var(--color-navy-dark); margin: 0;">${LabProblemService.getCategoryLabel(report.category)}</p>
              </div>
              <div>
                <p style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin: 0 0 0.25rem 0;">Priority</p>
                <span style="display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.85rem; font-weight: 700; color: ${priorityDetails.color};">
                  ${priorityDetails.label}
                </span>
              </div>
              <div>
                <p style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin: 0 0 0.25rem 0;">Status</p>
                <span style="display: inline-block; padding: 0.15rem 0.6rem; border-radius: 999px; font-size: 0.8rem; font-weight: 700; background: ${statusDetails.bg}; color: ${statusDetails.color}; border: 1px solid ${statusDetails.color}30;">
                  ${statusDetails.label}
                </span>
              </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
              <p style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin: 0 0 0.5rem 0;">Problem Title</p>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--color-navy-dark); margin: 0;">${report.title}</h3>
            </div>

            <div style="margin-bottom: 1.5rem;">
              <p style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin: 0 0 0.5rem 0;">Description</p>
              <div style="font-size: 0.9rem; color: var(--color-text-regular); line-height: 1.6; background: #F1F5F9; padding: 1rem; border-radius: 8px; border-left: 4px solid var(--poornima-blue); white-space: pre-wrap;">${report.description}</div>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--color-text-light); border-top: 1px solid var(--color-border-light); padding-top: 1rem;">
              <div><span style="font-weight: 600;">Submitted:</span> ${dateStr}</div>
              <div><span style="font-weight: 600;">Last Updated:</span> ${updateStr}</div>
            </div>

          </div>
        </div>
      </div>
    `;
  },

  renderTable() {
    const container = document.getElementById('myReportsTableContainer');
    if (!container) return;

    if (this.reports.length === 0) {
      container.innerHTML = `
        <div style="padding: 4rem 2rem; text-align: center; color: var(--color-text-muted);">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: #F1F5F9; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem auto; color: #94A3B8;">
            <i data-lucide="inbox" style="width: 32px; height: 32px;"></i>
          </div>
          <p style="font-size: 1.1rem; font-weight: 600; color: var(--color-navy-dark); margin: 0 0 0.5rem 0;">No Reports Found</p>
          <p style="margin: 0 0 1.5rem 0; font-size: 0.95rem;">You haven't submitted any laboratory problem reports yet.</p>
          <button class="btn-primary" onclick="App.navigateTo('lab-problem-report')" style="background: var(--poornima-blue);">Report a Problem</button>
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
            <th style="padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Category & Lab</th>
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
                  <div style="font-size: 0.75rem; color: var(--color-text-light);">ID: ${report.id}</div>
                </td>
                <td style="padding: 1rem;">
                  <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-navy-dark); margin-bottom: 0.15rem;">${LabProblemService.getCategoryLabel(report.category)}</div>
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
                  <button class="btn-secondary btn-sm" onclick="MyLabReportsView.viewDetails('${report.id}')" style="display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; padding: 0.4rem 0.75rem;">
                    <i data-lucide="eye" style="width: 14px; height: 14px;"></i> View
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
          <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--color-navy-dark); margin-bottom: 0.25rem;">My Problem Reports</h1>
          <p style="color: var(--color-text-muted); font-size: 1rem;">View and track the status of your submitted reports.</p>
        </div>
        <div class="glass-panel" style="padding: 4rem; text-align: center;">
          <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid var(--glass-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 1s infinite linear;"></div>
          <p style="margin-top: 1.5rem; color: var(--color-text-muted); font-weight: 600;">Loading reports...</p>
        </div>
      `;
    }

    setTimeout(() => this.renderTable(), 0);

    return `
      <div class="page-header" style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--color-navy-dark); margin-bottom: 0.25rem;">My Problem Reports</h1>
          <p style="color: var(--color-text-muted); font-size: 1rem;">View and track the status of your submitted reports.</p>
        </div>
        <div>
          <button class="btn-primary" onclick="App.navigateTo('lab-problem-report')" style="display: flex; align-items: center; gap: 0.5rem; background: var(--poornima-blue);">
            <i data-lucide="plus-circle" style="width: 18px; height: 18px;"></i>
            Report Problem
          </button>
        </div>
      </div>

      <div class="glass-panel" style="padding: 0; overflow: hidden; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div id="myReportsTableContainer" style="width: 100%; overflow-x: auto;">
          <!-- Table will be injected here -->
        </div>
      </div>
    `;
  }
};

window.MyLabReportsView = MyLabReportsView;

/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - LAB ASSISTANT DASHBOARD
   Standalone dashboard for Lab Assistants (Problem Reporting Stats)
   ========================================================================== */

const DashboardLabAssistant = {
  loading: true,
  myReports: [],

  afterRender() {
    if (this.loading) {
      this.fetchData();
    }
  },

  async fetchData() {
    try {
      const user = authService.getCurrentUser();
      
      if (typeof LabProblemService !== 'undefined') {
        this.myReports = await LabProblemService.getReportsByUser(user.uid || user.id);
      }
      
      this.loading = false;
      App.renderCurrentView();
    } catch (err) {
      this.loading = false;
      console.error("Failed to load dashboard data:", err);
      App.renderCurrentView();
    }
  },

  render() {
    const user = authService.getCurrentUser();

    if (this.loading) {
      return `
        <div class="page-header" style="margin-bottom: 2rem;">
          <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--color-navy-dark); margin-bottom: 0.25rem;">Welcome, ${user.name}! 👋</h1>
          <p style="color: var(--color-text-muted); font-size: 1rem;">Lab Assistant Portal — Loading your dashboard...</p>
        </div>
        <div class="glass-panel" style="padding: 4rem; text-align: center;">
          <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid var(--glass-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 1s infinite linear;"></div>
          <p style="margin-top: 1.5rem; color: var(--color-text-muted); font-weight: 600;">Loading dashboard data...</p>
          <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        </div>
      `;
    }

    // Calculate Statistics
    const openProblems = this.myReports.filter(r => r.status === 'SUBMITTED' || r.status === 'ACKNOWLEDGED').length;
    const highPriority = this.myReports.filter(r => r.priority === 'HIGH' || r.priority === 'URGENT').length;
    const inProgress = this.myReports.filter(r => r.status === 'IN_PROGRESS').length;
    const resolved = this.myReports.filter(r => r.status === 'RESOLVED' || r.status === 'CLOSED').length;

    const recentReports = this.myReports.slice(0, 5);

    return `
      <div class="page-header" style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--color-navy-dark); margin-bottom: 0.25rem;">
            Welcome, ${user.name}! 👋
          </h1>
          <p style="color: var(--color-text-muted); font-size: 1rem;">
            Lab Assistant Portal
          </p>
        </div>
        <div>
          <button class="btn-primary" onclick="App.navigateTo('lab-problem-report')" style="display: flex; align-items: center; gap: 0.5rem; background: var(--poornima-blue);">
            <i data-lucide="plus-circle" style="width: 18px; height: 18px;"></i>
            Report Problem
          </button>
        </div>
      </div>

      <!-- STATISTICS CARDS -->
      <div class="dashboard-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        
        <div class="stat-card glass-panel" style="padding: 1.5rem; display: flex; align-items: center; gap: 1rem; transition: transform 0.2s; cursor: pointer;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'" onclick="App.navigateTo('my-lab-reports')">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: #EFF6FF; color: #2563EB; display: flex; align-items: center; justify-content: center;">
            <i data-lucide="alert-circle" style="width: 24px; height: 24px;"></i>
          </div>
          <div>
            <h3 style="font-size: 0.85rem; color: var(--color-text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 0.25rem 0;">Open Problems</h3>
            <div style="font-size: 1.8rem; font-weight: 800; color: var(--color-navy-dark);">${openProblems}</div>
          </div>
        </div>

        <div class="stat-card glass-panel" style="padding: 1.5rem; display: flex; align-items: center; gap: 1rem; transition: transform 0.2s; cursor: pointer;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'" onclick="App.navigateTo('my-lab-reports')">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: #FEF2F2; color: #DC2626; display: flex; align-items: center; justify-content: center;">
            <i data-lucide="flame" style="width: 24px; height: 24px;"></i>
          </div>
          <div>
            <h3 style="font-size: 0.85rem; color: var(--color-text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 0.25rem 0;">High Priority</h3>
            <div style="font-size: 1.8rem; font-weight: 800; color: var(--color-navy-dark);">${highPriority}</div>
          </div>
        </div>

        <div class="stat-card glass-panel" style="padding: 1.5rem; display: flex; align-items: center; gap: 1rem; transition: transform 0.2s; cursor: pointer;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'" onclick="App.navigateTo('my-lab-reports')">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: #FFF7ED; color: #EA580C; display: flex; align-items: center; justify-content: center;">
            <i data-lucide="wrench" style="width: 24px; height: 24px;"></i>
          </div>
          <div>
            <h3 style="font-size: 0.85rem; color: var(--color-text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 0.25rem 0;">In Progress</h3>
            <div style="font-size: 1.8rem; font-weight: 800; color: var(--color-navy-dark);">${inProgress}</div>
          </div>
        </div>

        <div class="stat-card glass-panel" style="padding: 1.5rem; display: flex; align-items: center; gap: 1rem; transition: transform 0.2s; cursor: pointer;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'" onclick="App.navigateTo('my-lab-reports')">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: #F0FDF4; color: #16A34A; display: flex; align-items: center; justify-content: center;">
            <i data-lucide="check-circle-2" style="width: 24px; height: 24px;"></i>
          </div>
          <div>
            <h3 style="font-size: 0.85rem; color: var(--color-text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 0.25rem 0;">Resolved</h3>
            <div style="font-size: 1.8rem; font-weight: 800; color: var(--color-navy-dark);">${resolved}</div>
          </div>
        </div>

      </div>

      <!-- RECENT REPORTS -->
      <div class="glass-panel" style="padding: 1.5rem; margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid var(--color-border-light);">
          <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--color-navy-dark); margin: 0; display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="clock" style="width: 20px; height: 20px; color: var(--color-primary);"></i>
            Recent Problem Reports
          </h2>
          <button class="btn-secondary btn-sm" onclick="App.navigateTo('my-lab-reports')">View All</button>
        </div>

        <div class="table-container" style="overflow-x: auto;">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #F8FAFC; border-bottom: 2px solid #E2E8F0;">
                <th style="padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Problem</th>
                <th style="padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Category</th>
                <th style="padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Lab</th>
                <th style="padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Priority</th>
                <th style="padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Status</th>
                <th style="padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Date</th>
              </tr>
            </thead>
            <tbody>
              ${recentReports.length > 0 ? recentReports.map(report => {
                const statusDetails = LabProblemService.getStatusDetails(report.status);
                const priorityDetails = LabProblemService.getPriorityDetails(report.priority);
                const dateObj = new Date(report.createdAt);
                const dateStr = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                
                return `
                  <tr style="border-bottom: 1px solid var(--color-border-light); transition: background 0.2s;" onmouseover="this.style.background='#F8FAFC'" onmouseout="this.style.background='transparent'">
                    <td style="padding: 1rem; font-size: 0.9rem; font-weight: 600; color: var(--color-navy-dark);">${report.title}</td>
                    <td style="padding: 1rem; font-size: 0.85rem; color: var(--color-text-regular);">${LabProblemService.getCategoryLabel(report.category)}</td>
                    <td style="padding: 1rem; font-size: 0.85rem; color: var(--color-text-regular);">${report.laboratoryName}</td>
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
                  </tr>
                `;
              }).join('') : `
                <tr>
                  <td colspan="6" style="padding: 3rem 1rem; text-align: center; color: var(--color-text-muted);">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                      <div style="width: 48px; height: 48px; border-radius: 50%; background: #F1F5F9; display: flex; align-items: center; justify-content: center; color: #94A3B8;">
                        <i data-lucide="inbox" style="width: 24px; height: 24px;"></i>
                      </div>
                      <p style="margin: 0; font-size: 0.95rem;">No laboratory problems reported yet.</p>
                      <button class="btn-secondary btn-sm" onclick="App.navigateTo('lab-problem-report')">Create Report</button>
                    </div>
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
};

window.DashboardLabAssistant = DashboardLabAssistant;

/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - LIBRARIAN DASHBOARD
   ========================================================================== */

const LibDashboardView = {
  stats: { total: 0, issued: 0, overdue: 0, fines: 0 },
  loading: true,

  afterRender() {
    if (this.loading) {
      this.fetchData();
    }
  },

  async fetchData() {
    try {
      if (window.LibraryService) {
        this.stats = await LibraryService.getDashboardStats();
      } else {
        this.stats = { total: 12540, issued: 432, overdue: 45, fines: 4500 };
      }
      this.loading = false;
      App.renderCurrentView();
    } catch (err) {
      this.loading = false;
      console.warn("Failed to load library stats:", err);
      App.renderCurrentView();
    }
  },

  render() {
    if (this.loading) {
      return `
        <div class="page-header" style="margin-bottom: 2rem;">
          <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--color-navy-dark); margin-bottom: 0.25rem;">Library Management</h1>
          <p style="color: var(--color-text-muted); font-size: 1rem;">Loading library operations data...</p>
        </div>
        <div class="glass-panel" style="padding: 4rem; text-align: center;">
          <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid var(--glass-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 1s infinite linear;"></div>
          <p style="margin-top: 1.5rem; color: var(--color-text-muted); font-weight: 600;">Loading dashboard data...</p>
          <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        </div>
      `;
    }

    return `
      <div class="page-header" style="margin-bottom: 2rem;">
        <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--color-navy-dark); margin-bottom: 0.25rem;">Library Management</h1>
        <p style="color: var(--color-text-muted); font-size: 1rem;">Centralized portal for books, issues, and fine management.</p>
      </div>

      <!-- CORE STATS -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2.5rem;">
        <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(59, 130, 246, 0.15); color: var(--color-primary); display: flex; align-items: center; justify-content: center;">
              <i data-lucide="book" style="width: 24px; height: 24px;"></i>
            </div>
            <span class="status-badge active">Database</span>
          </div>
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 0.25rem;">Total Books</div>
          <div style="font-size: 2.5rem; font-weight: 800; color: var(--color-navy-dark);">${this.stats.total.toLocaleString()}</div>
        </div>

        <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(139, 92, 246, 0.15); color: var(--color-accent); display: flex; align-items: center; justify-content: center;">
              <i data-lucide="arrow-up-right" style="width: 24px; height: 24px;"></i>
            </div>
            <span class="status-badge present">Active</span>
          </div>
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 0.25rem;">Issued Books</div>
          <div style="font-size: 2.5rem; font-weight: 800; color: var(--color-navy-dark);">${this.stats.issued.toLocaleString()}</div>
        </div>

        <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: var(--color-warning-bg); color: var(--color-warning); display: flex; align-items: center; justify-content: center;">
              <i data-lucide="clock" style="width: 24px; height: 24px;"></i>
            </div>
            <span class="status-badge pending">Attention</span>
          </div>
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 0.25rem;">Overdue Returns</div>
          <div style="font-size: 2.5rem; font-weight: 800; color: var(--color-warning);">${this.stats.overdue.toLocaleString()}</div>
        </div>

        <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: var(--color-danger-bg); color: var(--color-danger); display: flex; align-items: center; justify-content: center;">
              <i data-lucide="indian-rupee" style="width: 24px; height: 24px;"></i>
            </div>
            <span class="status-badge absent">Outstanding</span>
          </div>
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 0.25rem;">Total Fines</div>
          <div style="font-size: 2.5rem; font-weight: 800; color: var(--color-danger);">₹${this.stats.fines.toLocaleString()}</div>
        </div>
      </div>

      <!-- MAIN GRID -->
      <div style="display: grid; grid-template-columns: 2.5fr 1fr; gap: 2rem;">
        
        <!-- LEFT: RECENT TRANSACTIONS -->
        <div class="glass-panel" style="padding: 2rem; background: rgba(255,255,255,0.6);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--color-navy-dark); display: flex; align-items: center; gap: 8px;">
              <i data-lucide="activity" style="color: var(--color-primary);"></i> Recent Transactions
            </h3>
            <button class="btn-secondary" onclick="App.navigateTo('library-transactions')" style="padding: 0.5rem 1rem; font-size: 0.85rem;">View All</button>
          </div>

          <div class="table-container" style="background: transparent; border: none; box-shadow: none;">
            <table class="data-table" style="background: #FFF; border-radius: var(--radius-md); overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
              <thead>
                <tr style="background: rgba(248, 250, 252, 0.8);">
                  <th>Student</th>
                  <th>Book Title</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div style="font-weight: 600; color: var(--color-navy-dark);">Rahul Sharma</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-muted);">PIET22CS014</div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--color-text-main);">Data Structures & Algorithms</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-muted);">ID: BK-7432</div>
                  </td>
                  <td><span class="status-badge present">Issued</span></td>
                  <td><span style="font-size: 0.85rem; color: var(--color-text-muted);">Today, 10:15 AM</span></td>
                </tr>
                <tr>
                  <td>
                    <div style="font-weight: 600; color: var(--color-navy-dark);">Priya Patel</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-muted);">PIET21IT055</div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--color-text-main);">Computer Networking</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-muted);">ID: BK-2910</div>
                  </td>
                  <td><span class="status-badge absent">Returned</span></td>
                  <td><span style="font-size: 0.85rem; color: var(--color-text-muted);">Yesterday, 03:45 PM</span></td>
                </tr>
                <tr>
                  <td>
                    <div style="font-weight: 600; color: var(--color-navy-dark);">Amit Kumar</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-muted);">PIET23EC089</div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--color-text-main);">Digital Electronics</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-muted);">ID: BK-5012</div>
                  </td>
                  <td><span class="status-badge pending">Overdue</span></td>
                  <td><span style="font-size: 0.85rem; color: var(--color-danger);">Due: 3 days ago</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- RIGHT: QUICK ACTIONS -->
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--color-navy-dark); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 8px;">
            <i data-lucide="zap" style="color: var(--color-accent);"></i> Quick Actions
          </h3>
          
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <button class="glass-card" onclick="App.navigateTo('library-issue')" style="display: flex; align-items: center; gap: 1rem; width: 100%; border: none; cursor: pointer; padding: 1.25rem;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(59, 130, 246, 0.15); color: var(--color-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><i data-lucide="arrow-up-right"></i></div>
              <div style="text-align: left;">
                <div style="font-weight: 700; color: var(--color-navy-dark); font-size: 1rem;">Issue Book</div>
                <div style="font-size: 0.8rem; color: var(--color-text-muted);">Assign books to students</div>
              </div>
            </button>
            
            <button class="glass-card" onclick="App.navigateTo('library-return')" style="display: flex; align-items: center; gap: 1rem; width: 100%; border: none; cursor: pointer; padding: 1.25rem;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--color-success-bg); color: var(--color-success); display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><i data-lucide="arrow-down-left"></i></div>
              <div style="text-align: left;">
                <div style="font-weight: 700; color: var(--color-navy-dark); font-size: 1rem;">Return Book</div>
                <div style="font-size: 0.8rem; color: var(--color-text-muted);">Process book returns & fines</div>
              </div>
            </button>

            <button class="glass-card" onclick="App.navigateTo('library-books')" style="display: flex; align-items: center; gap: 1rem; width: 100%; border: none; cursor: pointer; padding: 1.25rem;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(139, 92, 246, 0.15); color: var(--color-accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><i data-lucide="book-plus"></i></div>
              <div style="text-align: left;">
                <div style="font-weight: 700; color: var(--color-navy-dark); font-size: 1rem;">Add/Manage Books</div>
                <div style="font-size: 0.8rem; color: var(--color-text-muted);">Update library inventory</div>
              </div>
            </button>

            <button class="glass-card" onclick="App.navigateTo('library-reports')" style="display: flex; align-items: center; gap: 1rem; width: 100%; border: none; cursor: pointer; padding: 1.25rem;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(15, 23, 42, 0.1); color: var(--color-navy-dark); display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><i data-lucide="file-text"></i></div>
              <div style="text-align: left;">
                <div style="font-weight: 700; color: var(--color-navy-dark); font-size: 1rem;">Library Reports</div>
                <div style="font-size: 0.8rem; color: var(--color-text-muted);">View usage analytics</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    `;
  }
};
window.LibDashboardView = LibDashboardView;

/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - LIBRARIAN DASHBOARD (FIRESTORE)
   Library-focused dashboard for the LIBRARIAN role with instant shell rendering
   ========================================================================== */

const DashboardLibrarian = {
  loading: false,
  stats: null,
  activeTransactions: [],
  _isFetching: false,

  async fetchStats() {
    if (this._isFetching) return;
    this._isFetching = true;

    try {
      this.stats = await LibraryService.getDashboardStats();
      this.loading = false;
      this._isFetching = false;
      
      // Update DOM values smoothly
      const s = this.stats;
      const issuedEl = document.getElementById('lib-dash-issued');
      if (issuedEl) issuedEl.innerText = s.issuedCopies;
      const overdueEl = document.getElementById('lib-dash-overdue');
      if (overdueEl) overdueEl.innerText = s.overdueCount;
      const finesEl = document.getElementById('lib-dash-fines');
      if (finesEl) finesEl.innerText = `₹${s.pendingFinesTotal}`;
      const booksEl = document.getElementById('lib-dash-books');
      if (booksEl) booksEl.innerText = s.totalBooks;
      const availEl = document.getElementById('lib-dash-avail');
      if (availEl) availEl.innerText = `${s.availableCopies} available copies`;
    } catch (err) {
      console.error("Failed to fetch library stats", err);
      this.loading = false;
      this._isFetching = false;
    }
  },

  render() {
    const user = authService.getCurrentUser() || { name: 'Librarian' };
    
    // Trigger non-blocking background fetch if stats not ready
    if (!this.stats) {
      setTimeout(() => this.fetchStats(), 0);
    }

    const s = this.stats || { totalBooks: 0, availableCopies: 0, issuedCopies: 0, overdueCount: 0, pendingFinesTotal: 0 };

    return `
      <div class="page-header">
        <div>
          <h1>Welcome, ${user.name}! 📚</h1>
          <p>Library Management Dashboard — Live statistics and quick operations.</p>
        </div>
      </div>

      <!-- STATS GRID -->
      <div class="stats-grid">
        <div class="stat-card" onclick="App.navigateTo('library-circulation')" style="cursor:pointer;">
          <div class="stat-info">
            <h3>Currently Issued</h3>
            <div class="value" id="lib-dash-issued">${this.stats ? s.issuedCopies : '<span class="loading-dots">...</span>'}</div>
            <span class="stat-trend positive">Active borrowings</span>
          </div>
          <div class="stat-icon blue"><i data-lucide="book-open"></i></div>
        </div>

        <div class="stat-card" onclick="App.navigateTo('library-circulation')" style="cursor:pointer;">
          <div class="stat-info">
            <h3>Overdue Books</h3>
            <div class="value" id="lib-dash-overdue" style="color: ${s.overdueCount > 0 ? 'var(--color-danger)' : 'var(--color-success)'};">
              ${this.stats ? s.overdueCount : '<span class="loading-dots">...</span>'}
            </div>
            <span class="stat-trend ${s.overdueCount > 0 ? 'negative' : 'positive'}">
              ${s.overdueCount > 0 ? 'Action required' : 'No overdue items'}
            </span>
          </div>
          <div class="stat-icon ${s.overdueCount > 0 ? 'red' : 'green'}"><i data-lucide="alert-triangle"></i></div>
        </div>

        <div class="stat-card" onclick="App.navigateTo('library-fines')" style="cursor:pointer;">
          <div class="stat-info">
            <h3>Pending Fines</h3>
            <div class="value" id="lib-dash-fines" style="color: ${s.pendingFinesTotal > 0 ? 'var(--color-warning)' : 'var(--color-success)'};">
              ${this.stats ? `₹${s.pendingFinesTotal}` : '<span class="loading-dots">...</span>'}
            </div>
            <span class="stat-trend ${s.pendingFinesTotal > 0 ? 'warning' : 'positive'}">
              Unpaid library fines
            </span>
          </div>
          <div class="stat-icon ${s.pendingFinesTotal > 0 ? 'amber' : 'green'}"><i data-lucide="indian-rupee"></i></div>
        </div>

        <div class="stat-card" onclick="App.navigateTo('library-books')" style="cursor:pointer;">
          <div class="stat-info">
            <h3>Total Book Titles</h3>
            <div class="value" id="lib-dash-books">${this.stats ? s.totalBooks : '<span class="loading-dots">...</span>'}</div>
            <span class="stat-trend positive" id="lib-dash-avail">${s.availableCopies} available copies</span>
          </div>
          <div class="stat-icon purple"><i data-lucide="library"></i></div>
        </div>
      </div>

      <!-- QUICK ACTIONS -->
      <div class="card" style="margin-bottom: 2rem; background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); color: white; border: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="margin: 0 0 0.4rem 0; font-size: 1.15rem; font-weight: 800; color: #F8FAFC;">
              Library Quick Actions
            </h3>
            <p style="margin: 0; font-size: 0.85rem; color: #94A3B8;">
              Manage inventory, issue/return books, and track library operations.
            </p>
          </div>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <button class="btn-primary" onclick="App.navigateTo('library-books')" style="background:#10B981; border-color:#10B981;">
              <i data-lucide="book-plus"></i> Add Book
            </button>
            <button class="btn-primary" onclick="App.navigateTo('library-circulation')" style="background:#2563EB;">
              <i data-lucide="rotate-ccw"></i> Circulation
            </button>
          </div>
        </div>
      </div>
    `;
  }
};

window.DashboardLibrarian = DashboardLibrarian;


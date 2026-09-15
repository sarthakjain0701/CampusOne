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

  async seedDemoData() {
    const btn = document.getElementById('seed-demo-btn');
    if(btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="loading-dots">...</span> Seeding...';
    }
    try {
      await window.LibraryService.seedTestData();
      window.UIService.showToast('Test data seeded successfully.', 'success');
      this.stats = null;
      this.fetchStats();
      App.renderCurrentView();
    } catch (err) {
      window.UIService.showToast(err.message, 'danger');
      if(btn) {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="database"></i> Seed Library Demo Data';
        window.lucide.createIcons();
      }
    }
  },

  render() {
    const user = authService.getCurrentUser() || { name: 'Librarian' };
    
    // Trigger non-blocking background fetch if stats not ready
    if (!this.stats) {
      setTimeout(() => this.fetchStats(), 0);
    }

    const s = this.stats || { totalBooks: 0, availableCopies: 0, issuedCopies: 0, overdueCount: 0, pendingFinesTotal: 0 };
    const loading = !this.stats;
    const loadingVal = `<span class="lib-skeleton"></span>`;

    return `
      <!-- DASHBOARD HEADER -->
      <div class="lib-dash-header">
        <div>
          <h1 class="lib-dash-title">Welcome, ${user.name}! 📚</h1>
          <p class="lib-dash-subtitle">Library Management Dashboard — Live statistics and quick operations.</p>
        </div>
        ${this.stats && s.totalBooks === 0 ? `
          <button class="btn-primary" id="seed-demo-btn" onclick="DashboardLibrarian.seedDemoData()" style="background:#8B5CF6; border-color:#7C3AED;">
            <i data-lucide="database"></i> Seed Library Demo Data
          </button>
        ` : ''}
      </div>

      <!-- FOUR STAT CARDS -->
      <div class="lib-stats-grid">

        <!-- CARD 1: Currently Issued — GREEN -->
        <div class="lib-stat-card lib-stat-card--issued" onclick="App.navigateTo('library-circulation')" role="button" tabindex="0" aria-label="Currently Issued books">
          <div class="lib-stat-icon-wrap lib-stat-icon-wrap--light">
            <i data-lucide="book-open"></i>
          </div>
          <div class="lib-stat-title">Currently Issued</div>
          <div class="lib-stat-value" id="lib-dash-issued">${loading ? loadingVal : s.issuedCopies}</div>
          <div class="lib-stat-meta">Active borrowings</div>
        </div>

        <!-- CARD 2: Overdue Books — AMBER/YELLOW -->
        <div class="lib-stat-card lib-stat-card--overdue" onclick="App.navigateTo('library-circulation')" role="button" tabindex="0" aria-label="Overdue Books">
          <div class="lib-stat-icon-wrap lib-stat-icon-wrap--dark">
            <i data-lucide="triangle-alert"></i>
          </div>
          <div class="lib-stat-title">Overdue Books</div>
          <div class="lib-stat-value" id="lib-dash-overdue">${loading ? loadingVal : s.overdueCount}</div>
          <div class="lib-stat-meta">${s.overdueCount > 0 ? 'Attention required' : 'No overdue items'}</div>
        </div>

        <!-- CARD 3: Pending Fines — MINT/LIGHT GREEN -->
        <div class="lib-stat-card lib-stat-card--fines" onclick="App.navigateTo('library-fines')" role="button" tabindex="0" aria-label="Pending Fines">
          <div class="lib-stat-icon-wrap lib-stat-icon-wrap--mint">
            <i data-lucide="indian-rupee"></i>
          </div>
          <div class="lib-stat-title">Pending Fines</div>
          <div class="lib-stat-value" id="lib-dash-fines">${loading ? loadingVal : `₹${s.pendingFinesTotal}`}</div>
          <div class="lib-stat-meta">Unpaid library fines</div>
        </div>

        <!-- CARD 4: Total Book Titles — BLUE -->
        <div class="lib-stat-card lib-stat-card--titles" onclick="App.navigateTo('library-books')" role="button" tabindex="0" aria-label="Total Book Titles">
          <div class="lib-stat-icon-wrap lib-stat-icon-wrap--light">
            <i data-lucide="library"></i>
          </div>
          <div class="lib-stat-title">Total Book Titles</div>
          <div class="lib-stat-value" id="lib-dash-books">${loading ? loadingVal : s.totalBooks}</div>
          <div class="lib-stat-meta" id="lib-dash-avail">${s.availableCopies} available copies</div>
        </div>

      </div>

      <!-- QUICK ACTIONS -->
      <div class="lib-quick-actions">
        <div class="lib-quick-actions-info">
          <h3 class="lib-quick-actions-title">Library Quick Actions</h3>
          <p class="lib-quick-actions-desc">Manage inventory, issue/return books, and track library operations.</p>
        </div>
        <div class="lib-quick-actions-btns">
          <button class="btn-primary lib-action-btn" onclick="App.navigateTo('library-books')">
            <i data-lucide="book-plus"></i> Add Book
          </button>
          <button class="btn-primary lib-action-btn lib-action-btn--secondary" onclick="App.navigateTo('library-circulation')">
            <i data-lucide="rotate-ccw"></i> Circulation
          </button>
        </div>
      </div>
    `;
  }
};

window.DashboardLibrarian = DashboardLibrarian;


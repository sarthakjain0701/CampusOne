/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - LIBRARIAN DASHBOARD
   Library-focused dashboard for the LIBRARIAN role.
   Reuses existing LibraryService data.
   ========================================================================== */

const DashboardLibrarian = {
  render() {
    const user = authService.getCurrentUser();
    const allRecords = LibraryService.getAllRecords().map(r => LibraryService.calculateOverdueStatus(r));
    const activeIssued = allRecords.filter(r => r.returnStatus !== 'RETURNED');
    const overdueBooks = allRecords.filter(r => r.returnStatus === 'OVERDUE');
    const unpaidFines = allRecords.filter(r => r.fineStatus === 'UNPAID' && r.fineAmount > 0);
    const totalFineAmount = unpaidFines.reduce((sum, r) => sum + r.fineAmount, 0);
    const recentlyReturned = allRecords.filter(r => r.returnStatus === 'RETURNED').slice(0, 5);

    return `
      <div class="page-header">
        <div>
          <h1>Welcome, ${user.name}! 📚</h1>
          <p>Library Management Dashboard — Manage book issues, returns, and overdue records.</p>
        </div>
      </div>

      <!-- STATS GRID -->
      <div class="stats-grid">
        <div class="stat-card" onclick="App.navigateTo('library')" style="cursor:pointer;">
          <div class="stat-info">
            <h3>Currently Issued</h3>
            <div class="value">${activeIssued.length}</div>
            <span class="stat-trend positive">Active borrowings</span>
          </div>
          <div class="stat-icon blue"><i data-lucide="book-open"></i></div>
        </div>

        <div class="stat-card" onclick="App.navigateTo('library')" style="cursor:pointer;">
          <div class="stat-info">
            <h3>Overdue Books</h3>
            <div class="value" style="color: ${overdueBooks.length > 0 ? 'var(--color-danger)' : 'var(--color-success)'};">
              ${overdueBooks.length}
            </div>
            <span class="stat-trend ${overdueBooks.length > 0 ? 'negative' : 'positive'}">
              ${overdueBooks.length > 0 ? 'Action required' : 'No overdue items'}
            </span>
          </div>
          <div class="stat-icon ${overdueBooks.length > 0 ? 'red' : 'green'}"><i data-lucide="alert-triangle"></i></div>
        </div>

        <div class="stat-card">
          <div class="stat-info">
            <h3>Total Outstanding Fine</h3>
            <div class="value" style="color: ${totalFineAmount > 0 ? 'var(--color-warning)' : 'var(--color-success)'};">
              ₹${totalFineAmount}
            </div>
            <span class="stat-trend ${totalFineAmount > 0 ? 'warning' : 'positive'}">
              Unpaid library fines
            </span>
          </div>
          <div class="stat-icon ${totalFineAmount > 0 ? 'amber' : 'green'}"><i data-lucide="indian-rupee"></i></div>
        </div>

        <div class="stat-card">
          <div class="stat-info">
            <h3>Total Records</h3>
            <div class="value">${allRecords.length}</div>
            <span class="stat-trend positive">All-time transactions</span>
          </div>
          <div class="stat-icon purple"><i data-lucide="database"></i></div>
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
              Issue or return books, view the full library catalog, or manage overdue records.
            </p>
          </div>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <button class="btn-primary" onclick="App.navigateTo('library')" style="background:#2563EB;">
              <i data-lucide="book"></i> Open Library Portal
            </button>
          </div>
        </div>
      </div>

      <!-- OVERDUE BOOKS LIST -->
      ${overdueBooks.length > 0 ? `
        <div class="card" style="margin-bottom: 2rem;">
          <div class="card-header">
            <h3 class="card-title" style="color: var(--color-danger);"><i data-lucide="alert-circle"></i> Overdue Books — Action Required</h3>
          </div>
          <div class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Author</th>
                  <th>Borrower ID</th>
                  <th>Due Date</th>
                  <th>Days Overdue</th>
                  <th>Fine</th>
                </tr>
              </thead>
              <tbody>
                ${overdueBooks.slice(0, 10).map(b => `
                  <tr>
                    <td><strong>${b.bookName}</strong></td>
                    <td>${b.author}</td>
                    <td>${b.studentId || b.userId || 'N/A'}</td>
                    <td>${b.dueDate}</td>
                    <td><span class="status-badge danger">${b.daysOverdue} days</span></td>
                    <td><strong style="color:var(--color-danger);">₹${b.fineAmount}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : `
        <div class="card" style="margin-bottom: 2rem;">
          <div class="card-header">
            <h3 class="card-title" style="color: var(--color-success);"><i data-lucide="check-circle"></i> All Clear</h3>
          </div>
          <div style="padding: 2rem; text-align: center; color: var(--color-success); font-weight: 500;">
            No overdue books at this time. Great job!
          </div>
        </div>
      `}

      <!-- RECENTLY ISSUED BOOKS -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="clock"></i> Recently Issued Books</h3>
        </div>
        ${activeIssued.length === 0 ? `
          <div style="padding: 2rem; text-align: center; color: var(--color-text-muted);">
            No active issued books at this time.
          </div>
        ` : `
          <div class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Author</th>
                  <th>Borrower</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${activeIssued.slice(0, 10).map(r => `
                  <tr>
                    <td><strong>${r.bookName}</strong></td>
                    <td>${r.author}</td>
                    <td>${r.studentId || r.userId || 'N/A'}</td>
                    <td>${r.issueDate}</td>
                    <td>${r.dueDate}</td>
                    <td><span class="status-badge ${r.returnStatus === 'OVERDUE' ? 'danger' : 'present'}">${r.returnStatus}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  }
};

window.DashboardLibrarian = DashboardLibrarian;

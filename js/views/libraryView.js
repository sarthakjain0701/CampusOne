/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - LIBRARY VIEW (STUDENT/FACULTY)
   Read-only portal for academic users
   ========================================================================== */

const LibraryView = {
  loading: true,
  transactions: [],
  fines: [],

  afterRender() {
    if (this.loading) {
      this.fetchData();
    }
  },

  async fetchData() {
    const user = authService.getCurrentUser();
    if (!user) return;

    try {
      const db = LibraryService._getDb();
      // Fetch user's transactions
      const transSnapshot = await db.collection('libraryTransactions').where('userId', '==', user.uid).get();
      this.transactions = transSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      // Fetch user's fines
      const fineSnapshot = await db.collection('libraryFines').where('userId', '==', user.uid).get();
      this.fines = fineSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      this.loading = false;
      App.renderCurrentView();
    } catch (err) {
      console.error(err);
      UIService.showToast("Failed to load library records.", "danger");
      this.loading = false;
    }
  },

  render(params = {}) {
    const user = authService.getCurrentUser();
    if (!user) return `<div class="card" style="padding:2rem; text-align:center;">Please log in to view Library Portal.</div>`;

    if (this.loading) {
      return `
        <div class="page-header"><h1>Library Portal</h1></div>
        <div class="card" style="padding: 3rem; text-align: center;">
          <div style="display: inline-block; width: 36px; height: 36px; border: 3px solid #E2E8F0; border-top-color: #2563EB; border-radius: 50%; animation: spin 1s infinite linear;"></div>
          <p style="margin-top: 1rem; color: var(--color-text-muted);">Loading your library records...</p>
        </div>
      `;
    }

    const activeIssued = this.transactions.filter(r => r.status !== 'RETURNED');
    const overdueBooks = this.transactions.filter(r => r.status === 'OVERDUE' || (r.status === 'ISSUED' && new Date(r.dueDate) < new Date()));
    const unpaidFines = this.fines.filter(r => r.status === 'PENDING');
    const totalFineAmount = unpaidFines.reduce((sum, r) => sum + r.amount, 0);

    return `
      <div class="page-header">
        <div>
          <h1>LIBRARY PORTAL</h1>
          <p>My Library History, Issued Books, and Fines</p>
        </div>
      </div>

      <!-- TOP SUMMARY CARDS -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-info">
            <h3>Currently Issued</h3>
            <div class="value">${activeIssued.length}</div>
            <span class="stat-trend positive">Active borrowings</span>
          </div>
          <div class="stat-icon blue"><i data-lucide="book-open"></i></div>
        </div>

        <div class="stat-card">
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
            <h3>Pending Fine</h3>
            <div class="value" style="color: ${totalFineAmount > 0 ? 'var(--color-warning)' : 'var(--color-success)'};">
              ₹${totalFineAmount}
            </div>
            <span class="stat-trend ${totalFineAmount > 0 ? 'warning' : 'positive'}">
              Outstanding library fines
            </span>
          </div>
          <div class="stat-icon ${totalFineAmount > 0 ? 'amber' : 'green'}"><i data-lucide="indian-rupee"></i></div>
        </div>
      </div>

      <!-- MY ISSUED BOOKS -->
      <div class="card" style="margin-bottom: 2rem;">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h3 class="card-title"><i data-lucide="book"></i> My Issued Books</h3>
        </div>
        
        ${this.transactions.length === 0 ? `
          <div style="padding: 2rem; text-align: center; color: var(--color-text-muted);">
            You have no issued books.
          </div>
        ` : `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Fine</th>
                </tr>
              </thead>
              <tbody>
                ${this.transactions.map(r => {
                  let statusClass = 'present';
                  let isOverdue = r.status === 'OVERDUE' || (r.status === 'ISSUED' && new Date(r.dueDate) < new Date());
                  if (isOverdue) statusClass = 'danger';
                  if (r.status === 'RETURNED') statusClass = 'active';

                  return `
                    <tr>
                      <td><strong>${r.bookTitle}</strong></td>
                      <td>${new Date(r.issueDate).toLocaleDateString()}</td>
                      <td><strong style="color: ${isOverdue ? 'var(--color-danger)' : 'inherit'};">${new Date(r.dueDate).toLocaleDateString()}</strong></td>
                      <td>
                        <span class="status-badge ${statusClass}">${isOverdue ? 'OVERDUE' : r.status}</span>
                      </td>
                      <td>${r.fineAmount > 0 ? `₹${r.fineAmount}` : '₹0'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  }
};

window.LibraryView = LibraryView;

/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - LIBRARY VIEW (STUDENT/FACULTY)
   Read-only portal for academic users with parallelized Firestore queries
   ========================================================================== */

const LibraryView = {
  loading: true,
  transactions: [],
  fines: [],
  errorMessage: null,

  afterRender() {
    if (this.loading) {
      this.fetchData();
    }
  },

  async fetchData() {
    const user = authService.getCurrentUser();
    if (!user) return;

    this.errorMessage = null;

    try {
      const db = LibraryService._getDb();
      const userEmail = (user.email || '').toLowerCase().trim();

      // Parallelize queries aligning with Firestore security rules
      const [transSnapshot, fineSnapshot] = await Promise.all([
        db.collection('libraryTransactions').where('memberEmail', '==', userEmail).get().catch(e => {
          console.warn("Transactions query warning:", e);
          return { docs: [] };
        }),
        db.collection('libraryFines').where('memberEmail', '==', userEmail).get().catch(e => {
          console.warn("Fines query warning:", e);
          return { docs: [] };
        })
      ]);

      this.transactions = transSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      this.fines = fineSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      this.loading = false;
      App.renderCurrentView();
    } catch (err) {
      console.error("LibraryView fetch error:", err);
      this.errorMessage = err.message || "Failed to load library records.";
      this.loading = false;
      App.renderCurrentView();
    }
  },

  retry() {
    this.loading = true;
    this.errorMessage = null;
    App.renderCurrentView();
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

    if (this.errorMessage) {
      return `
        <div class="page-header"><h1>Library Portal</h1></div>
        <div class="card" style="padding: 3rem; text-align: center; border-color: #FECACA;">
          <div style="width:48px; height:48px; border-radius:50%; background:#FEE2E2; color:#DC2626; display:flex; align-items:center; justify-content:center; margin:0 auto 1rem auto;">
            <i data-lucide="alert-circle" style="width:28px; height:28px;"></i>
          </div>
          <h3 style="color:#991B1B; font-weight:700; margin-bottom:0.5rem;">Unable to load library records</h3>
          <p style="color:var(--color-text-muted); font-size:0.9rem; margin-bottom:1.25rem;">${this.errorMessage}</p>
          <button class="btn-primary" onclick="LibraryView.retry()">
            <i data-lucide="refresh-cw"></i> Retry
          </button>
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

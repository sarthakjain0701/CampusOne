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
      let userEmail = (user.email || '').toLowerCase().trim();
      let studentId = user.uid || user.id;

      if (user.role === 'STUDENT' && typeof studentService !== 'undefined' && studentService.resolveStudentProfile) {
        const profile = await studentService.resolveStudentProfile(user);
        if (profile) {
          studentId = profile.id;
          if (profile.email) userEmail = profile.email.toLowerCase().trim();
        }
      }

      // Parallelize queries aligning with Firestore security rules
      const fetchPromise = Promise.all([
        db.collection('libraryTransactions').where('userId', '==', studentId).get().then(snap => {
          if (!snap.empty) return snap;
          return userEmail ? db.collection('libraryTransactions').where('memberEmail', '==', userEmail).get() : snap;
        }),
        db.collection('libraryFines').where('userId', '==', studentId).get().then(snap => {
          if (!snap.empty) return snap;
          return userEmail ? db.collection('libraryFines').where('memberEmail', '==', userEmail).get() : snap;
        })
      ]);

      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out after 8 seconds')), 8000));
      const [transSnapshot, fineSnapshot] = await Promise.race([fetchPromise, timeoutPromise]);

      this.transactions = transSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      this.fines = fineSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error("LibraryView fetch error:", err);
      this.errorMessage = err.message || "Failed to load library records.";
    } finally {
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

      <!-- TOP SUMMARY CARDS (SQUARE REDESIGN) -->
      <style>
        .library-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .library-stat-card {
          aspect-ratio: 1 / 1;
          border-radius: 16px;
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.5);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .library-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .library-stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: auto;
        }
        .library-stat-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.25rem;
          line-height: 1.2;
        }
        .library-stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 0.5rem;
        }
        .library-stat-desc {
          font-size: 0.85rem;
          font-weight: 500;
          opacity: 0.8;
        }
        
        /* THEMES */
        .library-stat-blue {
          background: linear-gradient(145deg, #EFF6FF 0%, #DBEAFE 100%);
          border-color: #BFDBFE;
          color: #1E3A8A;
        }
        .library-stat-blue .library-stat-icon-wrapper {
          background: #3B82F6;
          color: white;
        }
        
        .library-stat-amber {
          background: linear-gradient(145deg, #FEF3C7 0%, #FDE68A 100%);
          border-color: #FCD34D;
          color: #92400E;
        }
        .library-stat-amber .library-stat-icon-wrapper {
          background: #F59E0B;
          color: white;
        }
        
        .library-stat-green {
          background: linear-gradient(145deg, #ECFDF5 0%, #D1FAE5 100%);
          border-color: #A7F3D0;
          color: #065F46;
        }
        .library-stat-green .library-stat-icon-wrapper {
          background: #10B981;
          color: white;
        }

        @media (max-width: 1024px) {
          .library-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .library-stats-grid {
            grid-template-columns: 1fr;
          }
          .library-stat-card {
            aspect-ratio: auto;
            min-height: 240px;
          }
        }
      </style>

      <div class="library-stats-grid">
        <!-- Currently Issued -->
        <div class="library-stat-card library-stat-blue">
          <div class="library-stat-icon-wrapper">
            <i data-lucide="book-open" style="width: 24px; height: 24px;"></i>
          </div>
          <div>
            <div class="library-stat-title">Currently<br>Issued</div>
            <div class="library-stat-value">${activeIssued.length}</div>
            <div class="library-stat-desc">Active borrowings</div>
          </div>
        </div>

        <!-- Overdue Books -->
        <div class="library-stat-card library-stat-amber">
          <div class="library-stat-icon-wrapper">
            <i data-lucide="alert-triangle" style="width: 24px; height: 24px;"></i>
          </div>
          <div>
            <div class="library-stat-title">Overdue<br>Books</div>
            <div class="library-stat-value">${overdueBooks.length}</div>
            <div class="library-stat-desc">${overdueBooks.length > 0 ? 'Action required' : 'No overdue items'}</div>
          </div>
        </div>

        <!-- Pending Fine -->
        <div class="library-stat-card library-stat-green">
          <div class="library-stat-icon-wrapper">
            <i data-lucide="indian-rupee" style="width: 24px; height: 24px;"></i>
          </div>
          <div>
            <div class="library-stat-title">Pending<br>Fine</div>
            <div class="library-stat-value">₹${totalFineAmount}</div>
            <div class="library-stat-desc">Outstanding library fines</div>
          </div>
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

/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - LIBRARY CIRCULATION VIEW
   Issue, Return, Renew, Overdue Management
   ========================================================================== */

const LibraryCirculationView = {
  transactions: [],
  loading: true,

  afterRender() {
    if (this.loading) {
      this.fetchTransactions();
    }
  },

  fetchTransactions() {
    LibraryService.listenToActiveTransactions((data) => {
      this.transactions = data;
      this.loading = false;
      
      const container = document.getElementById('circulation-table-body');
      if (container) {
        container.innerHTML = this.renderTableRows();
      } else {
        App.renderCurrentView();
      }
    });
  },

  render() {
    if (this.loading) {
      return `
        <div class="page-header">
          <div><h1>Circulation Management</h1></div>
        </div>
        <div class="card" style="padding: 3rem; text-align: center;">
          <div style="display: inline-block; width: 36px; height: 36px; border: 3px solid #E2E8F0; border-top-color: #2563EB; border-radius: 50%; animation: spin 1s infinite linear;"></div>
          <p style="margin-top: 1rem; color: var(--color-text-muted);">Loading active transactions...</p>
        </div>
      `;
    }

    return `
      <div class="page-header">
        <div>
          <h1>Circulation Management</h1>
          <p>Issue books, process returns, and manage overdue items.</p>
        </div>
        <div style="display:flex; gap:0.75rem;">
          <button class="btn-primary" onclick="LibraryCirculationView.openIssueModal()">
            <i data-lucide="book-up"></i> Issue Book
          </button>
          <button class="btn-secondary" onclick="LibraryCirculationView.openReturnModal()">
            <i data-lucide="book-down"></i> Return Book
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h3 class="card-title"><i data-lucide="arrow-right-left"></i> Active Transactions</h3>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Copy ID</th>
                <th>Borrower (User ID)</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="circulation-table-body">
              ${this.renderTableRows()}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderTableRows() {
    if (this.transactions.length === 0) {
      return `<tr><td colspan="7" style="text-align:center; color:var(--color-text-muted); padding:2rem;">No active transactions.</td></tr>`;
    }

    const todayStr = new Date().toISOString();

    return this.transactions.map(t => {
      const isOverdue = t.status === 'OVERDUE' || (t.status === 'ISSUED' && t.dueDate < todayStr);
      const statusClass = isOverdue ? 'danger' : 'present';
      const statusText = isOverdue ? 'OVERDUE' : 'ISSUED';

      return `
        <tr>
          <td><strong>${t.bookTitle}</strong></td>
          <td><small style="color:var(--color-text-muted);">${t.copyId}</small></td>
          <td><strong>${t.userId}</strong></td>
          <td>${new Date(t.issueDate).toLocaleDateString()}</td>
          <td><strong style="color: ${isOverdue ? 'var(--color-danger)' : 'inherit'};">${new Date(t.dueDate).toLocaleDateString()}</strong></td>
          <td><span class="status-badge ${statusClass}">${statusText}</span></td>
          <td>
            <button class="btn-xs btn-secondary" onclick="LibraryCirculationView.processReturn('${t.id}')">
              Return
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  async openIssueModal() {
    const books = await LibraryService.getBooks();
    const availableBooks = books.filter(b => b.availableCopies > 0);

    const modalId = 'pams-issue-book-modal';
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const modalHtml = `
      <div id="${modalId}" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.8); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:999; padding:1rem;">
        <div style="background:white; border-radius:16px; width:500px; max-width:100%; box-shadow:0 20px 40px rgba(0,0,0,0.3); overflow:hidden; border:1px solid var(--color-border); animation:fadeIn 0.2s ease-out;">
          <div style="background:var(--color-navy-dark); color:white; padding:1.25rem 1.5rem; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:0.6rem;">
              <i data-lucide="book-up" style="color:#60A5FA;"></i>
              <h3 style="margin:0; font-size:1.15rem; font-weight:800;">ISSUE BOOK</h3>
            </div>
            <button onclick="document.getElementById('${modalId}').remove()" style="background:none; border:none; color:white; cursor:pointer; font-size:1.2rem;">✕</button>
          </div>

          <div style="padding:1.5rem;">
            <form onsubmit="LibraryCirculationView.submitIssueForm(event)">
              <div class="form-group" style="margin-bottom:1rem;">
                <label class="form-label">User Email / ID *</label>
                <input type="text" id="issue-user-id" class="form-input" placeholder="e.g. student@poornima.edu.in" required>
              </div>
              <div class="form-group" style="margin-bottom:1.5rem;">
                <label class="form-label">Select Book *</label>
                <select id="issue-book-id" class="form-select" onchange="LibraryCirculationView.loadAvailableCopies(this.value)" required>
                  <option value="">-- Select a Book --</option>
                  ${availableBooks.map(b => `<option value="${b.id}">${b.title} (${b.availableCopies} available)</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="margin-bottom:1.5rem;">
                <label class="form-label">Select Physical Copy *</label>
                <select id="issue-copy-id" class="form-select" required disabled>
                  <option value="">-- Select Book First --</option>
                </select>
              </div>

              <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
                <button type="button" class="btn-secondary" onclick="document.getElementById('${modalId}').remove()">Cancel</button>
                <button type="submit" class="btn-primary"><i data-lucide="check"></i> Confirm Issue</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (window.lucide) window.lucide.createIcons();
  },

  async loadAvailableCopies(bookId) {
    const copySelect = document.getElementById('issue-copy-id');
    if (!bookId) {
      copySelect.innerHTML = '<option value="">-- Select Book First --</option>';
      copySelect.disabled = true;
      return;
    }

    copySelect.innerHTML = '<option value="">Loading copies...</option>';
    copySelect.disabled = true;

    try {
      const copies = await LibraryService.getBookCopies(bookId);
      const availableCopies = copies.filter(c => c.status === 'AVAILABLE');
      
      if (availableCopies.length === 0) {
        copySelect.innerHTML = '<option value="">No available copies</option>';
      } else {
        copySelect.innerHTML = `
          <option value="">-- Select a Copy --</option>
          ${availableCopies.map(c => `<option value="${c.id}">${c.id} (Condition: ${c.condition})</option>`).join('')}
        `;
        copySelect.disabled = false;
      }
    } catch (err) {
      console.error(err);
      UIService.showToast("Failed to load copies.", "danger");
      copySelect.innerHTML = '<option value="">Error loading copies</option>';
    }
  },

  async submitIssueForm(e) {
    e.preventDefault();
    const userId = document.getElementById('issue-user-id').value;
    const bookId = document.getElementById('issue-book-id').value;
    const copyId = document.getElementById('issue-copy-id').value;

    try {
      await LibraryService.issueBook(userId, bookId, copyId);
      UIService.showToast("Book issued successfully!", "success");
      document.getElementById('pams-issue-book-modal').remove();
    } catch (err) {
      UIService.showToast(err.message || "Failed to issue book.", "danger");
      console.error(err);
    }
  },

  openReturnModal() {
    const modalId = 'pams-return-book-modal';
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const modalHtml = `
      <div id="${modalId}" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.8); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:999; padding:1rem;">
        <div style="background:white; border-radius:16px; width:500px; max-width:100%; box-shadow:0 20px 40px rgba(0,0,0,0.3); overflow:hidden; border:1px solid var(--color-border); animation:fadeIn 0.2s ease-out;">
          <div style="background:var(--color-navy-dark); color:white; padding:1.25rem 1.5rem; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:0.6rem;">
              <i data-lucide="book-down" style="color:#60A5FA;"></i>
              <h3 style="margin:0; font-size:1.15rem; font-weight:800;">RETURN BOOK</h3>
            </div>
            <button onclick="document.getElementById('${modalId}').remove()" style="background:none; border:none; color:white; cursor:pointer; font-size:1.2rem;">✕</button>
          </div>

          <div style="padding:1.5rem;">
            <form onsubmit="LibraryCirculationView.submitReturnForm(event)">
              <div class="form-group" style="margin-bottom:1.5rem;">
                <label class="form-label">Select Active Transaction *</label>
                <select id="return-transaction-id" class="form-select" required>
                  <option value="">-- Select Transaction --</option>
                  ${this.transactions.map(t => `<option value="${t.id}">${t.bookTitle} (User: ${t.userId})</option>`).join('')}
                </select>
              </div>

              <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
                <button type="button" class="btn-secondary" onclick="document.getElementById('${modalId}').remove()">Cancel</button>
                <button type="submit" class="btn-primary"><i data-lucide="check"></i> Confirm Return</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (window.lucide) window.lucide.createIcons();
  },

  async submitReturnForm(e) {
    e.preventDefault();
    const transactionId = document.getElementById('return-transaction-id').value;
    this.processReturn(transactionId);
    document.getElementById('pams-return-book-modal').remove();
  },

  processReturn(transactionId) {
    UIService.showConfirm("Confirm Return", "Are you sure you want to return this book?", async () => {
      try {
        await LibraryService.returnBook(transactionId);
        UIService.showToast("Book returned successfully! Any applicable fines have been recorded.", "success");
      } catch (err) {
        UIService.showToast(err.message || "Failed to return book.", "danger");
        console.error(err);
      }
    });
  }
};

window.LibraryCirculationView = LibraryCirculationView;


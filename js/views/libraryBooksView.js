/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - LIBRARY BOOKS VIEW
   Manage Books and Inventory with robust error boundary & retry
   ========================================================================== */

const LibraryBooksView = {
  books: [],
  loading: true,
  errorMessage: null,
  lastVisible: null,
  hasMore: true,
  searchTimeout: null,

  afterRender() {
    if (this.loading) {
      this.fetchBooks();
    }
  },

  async fetchBooks(loadMore = false) {
    this.errorMessage = null;
    try {
      if (!loadMore) {
        this.books = [];
        this.lastVisible = null;
        this.hasMore = true;
      }
      const res = await LibraryService.getBooks(50, this.lastVisible);
      this.books = [...this.books, ...(res.books || [])];
      this.lastVisible = res.lastVisible;
      if (!res.books || res.books.length < 50) this.hasMore = false;
      
      this.loading = false;
      App.renderCurrentView();
    } catch (error) {
      console.error("LibraryBooksView fetch error:", error);
      this.errorMessage = error.message || "Failed to load library books.";
      this.loading = false;
      App.renderCurrentView();
    }
  },

  retry() {
    this.loading = true;
    this.errorMessage = null;
    App.renderCurrentView();
  },

  render() {
    if (this.loading) {
      return `
        <div class="page-header">
          <div><h1>Books & Inventory</h1></div>
        </div>
        <div class="card" style="padding: 3rem; text-align: center;">
          <div style="display: inline-block; width: 36px; height: 36px; border: 3px solid #E2E8F0; border-top-color: #2563EB; border-radius: 50%; animation: spin 1s infinite linear;"></div>
          <p style="margin-top: 1rem; color: var(--color-text-muted);">Loading books from Firestore...</p>
        </div>
      `;
    }

    if (this.errorMessage) {
      return `
        <div class="page-header">
          <div><h1>Books & Inventory</h1></div>
        </div>
        <div class="card" style="padding: 3rem; text-align: center; border-color: #FECACA;">
          <div style="width:48px; height:48px; border-radius:50%; background:#FEE2E2; color:#DC2626; display:flex; align-items:center; justify-content:center; margin:0 auto 1rem auto;">
            <i data-lucide="alert-circle" style="width:28px; height:28px;"></i>
          </div>
          <h3 style="color:#991B1B; font-weight:700; margin-bottom:0.5rem;">Unable to load library catalog</h3>
          <p style="color:var(--color-text-muted); font-size:0.9rem; margin-bottom:1.25rem;">${this.errorMessage}</p>
          <button class="btn-primary" onclick="LibraryBooksView.retry()">
            <i data-lucide="refresh-cw"></i> Retry
          </button>
        </div>
      `;
    }

    return `
      <div class="page-header">
        <div>
          <h1>Books & Inventory</h1>
          <p>Manage library books, catalog, and physical copies.</p>
        </div>
        <button class="btn-primary" onclick="LibraryBooksView.openAddBookModal()">
          <i data-lucide="book-plus"></i> Add New Book
        </button>
      </div>

      <div class="card">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h3 class="card-title"><i data-lucide="library"></i> Book Catalog</h3>
          <div class="search-box">
            <i data-lucide="search"></i>
            <input type="text" id="library-book-search" class="search-input" placeholder="Search title, author, ISBN..." onkeyup="LibraryBooksView.filterBooks(this.value)">
          </div>
        </div>

        ${this.books.length === 0 ? `
          <div style="padding: 2rem; text-align: center; color: var(--color-text-muted);">
            No books found in the library catalog.
          </div>
        ` : `
          <div class="table-responsive">
            <table class="data-table" id="books-table">
              <thead>
                <tr>
                  <th>Title & Info</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Total Copies</th>
                  <th>Available</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${this.books.map(b => `
                  <tr>
                    <td>
                      <strong>${b.title}</strong>
                      <br><small style="color:var(--color-text-muted);">ISBN: ${b.isbn || 'N/A'}</small>
                    </td>
                    <td>${b.author}</td>
                    <td>${b.category || 'General'}</td>
                    <td>${b.totalCopies}</td>
                    <td><strong style="color: ${b.availableCopies > 0 ? 'var(--color-success)' : 'var(--color-danger)'};">${b.availableCopies}</strong></td>
                    <td><span class="status-badge ${b.status === 'ACTIVE' ? 'present' : 'danger'}">${b.status}</span></td>
                    <td>
                      <button class="btn-xs btn-secondary" onclick="LibraryBooksView.openAddCopiesModal('${b.id}')" title="Add Physical Copies">
                        <i data-lucide="plus-circle" style="width:14px; height:14px;"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ${this.hasMore ? `
          <div style="padding: 1.5rem; text-align: center;">
            <button class="btn-secondary" onclick="LibraryBooksView.fetchBooks(true)">
              Load More Books
            </button>
          </div>
          ` : ''}
        `}
      </div>
    `;
  },

  filterBooks(query) {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(async () => {
      const q = query.trim();
      if (!q) {
        this.fetchBooks(false);
        return;
      }
      try {
        const searched = await LibraryService.searchBooks(q, 50);
        this.books = searched;
        this.hasMore = false; // Disable load more during search
        App.renderCurrentView();
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 400);
  },

  openAddBookModal() {
    const modalId = 'pams-add-book-modal';
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const modalHtml = `
      <div id="${modalId}" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.8); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:999; padding:1rem;">
        <div style="background:white; border-radius:16px; width:600px; max-width:100%; box-shadow:0 20px 40px rgba(0,0,0,0.3); overflow:hidden; border:1px solid var(--color-border); animation:fadeIn 0.2s ease-out; display:flex; flex-direction:column; max-height:90vh;">
          
          <div style="background:var(--color-navy-dark); color:white; padding:1.25rem 1.5rem; display:flex; justify-content:space-between; align-items:center; flex-shrink:0;">
            <div style="display:flex; align-items:center; gap:0.6rem;">
              <i data-lucide="book-plus" style="color:#60A5FA;"></i>
              <h3 style="margin:0; font-size:1.15rem; font-weight:800;">ADD NEW BOOK</h3>
            </div>
            <button onclick="document.getElementById('${modalId}').remove()" style="background:none; border:none; color:white; cursor:pointer; font-size:1.2rem;">✕</button>
          </div>

          <div style="padding:1.5rem; overflow-y:auto; flex-grow:1;">
            <form onsubmit="LibraryBooksView.submitAddBookForm(event)">
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
                <div class="form-group">
                  <label class="form-label">ISBN *</label>
                  <input type="text" id="book-isbn" class="form-input" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Category *</label>
                  <select id="book-category" class="form-select" required>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
              </div>

              <div class="form-group" style="margin-bottom:1rem;">
                <label class="form-label">Book Title *</label>
                <input type="text" id="book-title" class="form-input" required>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem;">
                <div class="form-group">
                  <label class="form-label">Author *</label>
                  <input type="text" id="book-author" class="form-input" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Publisher *</label>
                  <input type="text" id="book-publisher" class="form-input" required>
                </div>
              </div>

              <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
                <button type="button" class="btn-secondary" onclick="document.getElementById('${modalId}').remove()">Cancel</button>
                <button type="submit" class="btn-primary"><i data-lucide="check"></i> Save Book</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (window.lucide) window.lucide.createIcons();
  },

  async submitAddBookForm(e) {
    e.preventDefault();
    const payload = {
      isbn: document.getElementById('book-isbn').value,
      title: document.getElementById('book-title').value,
      author: document.getElementById('book-author').value,
      publisher: document.getElementById('book-publisher').value,
      category: document.getElementById('book-category').value,
    };

    try {
      await LibraryService.addBook(payload);
      UIService.showToast("Book added successfully!", "success");
      document.getElementById('pams-add-book-modal').remove();
      this.loading = true; // Trigger refresh
      App.renderCurrentView();
    } catch (err) {
      UIService.showToast("Failed to add book.", "danger");
      console.error(err);
    }
  },

  openAddCopiesModal(bookId) {
    const book = this.books.find(b => b.id === bookId);
    if(!book) return;

    const modalId = 'pams-add-copy-modal';
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const modalHtml = `
      <div id="${modalId}" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.8); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:999; padding:1rem;">
        <div style="background:white; border-radius:16px; width:500px; max-width:100%; box-shadow:0 20px 40px rgba(0,0,0,0.3); overflow:hidden; border:1px solid var(--color-border); animation:fadeIn 0.2s ease-out;">
          <div style="background:var(--color-navy-dark); color:white; padding:1.25rem 1.5rem; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:0.6rem;">
              <i data-lucide="layers" style="color:#60A5FA;"></i>
              <h3 style="margin:0; font-size:1.15rem; font-weight:800;">ADD COPIES</h3>
            </div>
            <button onclick="document.getElementById('${modalId}').remove()" style="background:none; border:none; color:white; cursor:pointer; font-size:1.2rem;">✕</button>
          </div>

          <div style="padding:1.5rem;">
            <p style="margin-bottom: 1rem; color: var(--color-text-muted);">Add physical copies for <strong>${book.title}</strong>.</p>
            <form onsubmit="LibraryBooksView.submitAddCopiesForm(event, '${bookId}')">
              <div class="form-group" style="margin-bottom:1rem;">
                <label class="form-label">Number of Copies *</label>
                <input type="number" id="copy-count" class="form-input" min="1" max="50" required>
              </div>
              <div class="form-group" style="margin-bottom:1.5rem;">
                <label class="form-label">Condition *</label>
                <select id="copy-condition" class="form-select" required>
                  <option value="GOOD">Good</option>
                  <option value="NEW">New</option>
                  <option value="FAIR">Fair</option>
                </select>
              </div>
              <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
                <button type="button" class="btn-secondary" onclick="document.getElementById('${modalId}').remove()">Cancel</button>
                <button type="submit" class="btn-primary"><i data-lucide="check"></i> Add Copies</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (window.lucide) window.lucide.createIcons();
  },

  async submitAddCopiesForm(e, bookId) {
    e.preventDefault();
    const count = parseInt(document.getElementById('copy-count').value, 10);
    const condition = document.getElementById('copy-condition').value;

    try {
      await LibraryService.addCopies(bookId, count, condition);
      UIService.showToast(`Successfully added ${count} copies!`, "success");
      document.getElementById('pams-add-copy-modal').remove();
      this.loading = true; // Trigger refresh
      App.renderCurrentView();
    } catch (err) {
      UIService.showToast(err.message || "Failed to add copies.", "danger");
      console.error(err);
    }
  }
};

window.LibraryBooksView = LibraryBooksView;


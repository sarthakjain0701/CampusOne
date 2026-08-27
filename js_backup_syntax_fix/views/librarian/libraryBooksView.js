const LibBooksView = {
  books: [],
  render() {
    setTimeout(() => {
      if(window.LibraryBackendService) {
        window.LibraryBackendService.getBooks(data => {
          this.books = data;
          this.updateTable();
        });
      }
    }, 100);

    return \
      <div class="page-header">
        <div>
          <h1>BOOK MANAGEMENT</h1>
          <p>Add, edit, and manage library books</p>
        </div>
        <button class="btn-primary" onclick="alert('Add Book Modal')">
          <i data-lucide="plus"></i> Add Book
        </button>
      </div>
      <div class="card" style="padding:2rem;">
        <div class="table-responsive">
          <table class="data-table" id="lib-books-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Available</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colspan="6" style="text-align:center;">Loading books...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    \;
  },
  updateTable() {
    const tbody = document.querySelector('#lib-books-table tbody');
    if(!tbody) return;
    if(this.books.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No books found.</td></tr>';
      return;
    }
    tbody.innerHTML = this.books.map(b => \
      <tr>
        <td>\</td>
        <td>\</td>
        <td>\</td>
        <td><span class="badge \">\</span></td>
        <td>\</td>
        <td>
          <button class="btn-xs btn-outline">Edit</button>
        </td>
      </tr>
    \).join('');
  }
};
window.LibBooksView = LibBooksView;

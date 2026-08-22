/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - LIBRARY VIEW CONTROLLER
   Integrated with QR Digital ID Verification, Book Issue & Return Workflows
   ========================================================================== */

const LibraryView = {
  loading: false,
  error: false,

  render(params = {}) {
    const user = authService.getCurrentUser();
    if (!user) return `<div class="card" style="padding:2rem; text-align:center;">Please log in to view Library Portal.</div>`;

    if (!AuthorizationService.canAccessLibrary(user)) {
      return AuthorizationService.renderAccessDeniedBanner("You are not authorized to access the Library Portal.");
    }

    if (this.loading) {
      return `
        <div class="page-header"><h1>Library Portal</h1></div>
        <div class="card" style="padding: 3rem; text-align: center;">
          <div style="display: inline-block; width: 36px; height: 36px; border: 3px solid #E2E8F0; border-top-color: #2563EB; border-radius: 50%; animation: spin 1s infinite linear;"></div>
          <p style="margin-top: 1rem; color: var(--color-text-muted);">Loading library portal...</p>
        </div>
      `;
    }

    const students = DataStore.get('STUDENTS') || [];
    const facultyList = DataStore.get('FACULTY') || [];
    const loggedInStudent = students.find(s => s.email === user.email || s.id === user.id) || students[0];
    
    // For student role, load their personal history
    const allRecords = user.role === 'STUDENT' && loggedInStudent ? 
      LibraryService.getStudentLibraryHistory(loggedInStudent.id) : 
      LibraryService.getAllRecords().map(r => LibraryService.calculateOverdueStatus(r));

    const activeIssued = allRecords.filter(r => r.returnStatus !== 'RETURNED');
    const overdueBooks = allRecords.filter(r => r.returnStatus === 'OVERDUE');
    const unpaidFines = allRecords.filter(r => r.fineStatus === 'UNPAID' && r.fineAmount > 0);
    const totalFineAmount = unpaidFines.reduce((sum, r) => sum + r.fineAmount, 0);

    return `
      <div class="page-header">
        <div>
          <h1>LIBRARY PORTAL</h1>
          <p>${user.role === 'STUDENT' ? `Student: <strong>${loggedInStudent?.name || user.name}</strong> | Roll No: <strong>${loggedInStudent?.rollNo || loggedInStudent?.rollNumber || 'N/A'}</strong>` : 'Poornima Group Library Management & Book Issue/Return Portal'}</p>
        </div>

        ${user.role === 'ADMIN' ? `
          <div style="display:flex; gap:0.75rem;">
            <button class="btn-primary" onclick="LibraryView.openIssueBookModal()">
              <i data-lucide="book-plus"></i> Issue Book
            </button>
            <button class="btn-secondary" onclick="LibraryView.openReturnBookModal()">
              <i data-lucide="rotate-ccw"></i> Return Book
            </button>
          </div>
        ` : ''}
      </div>

      <!-- LIBRARY OPERATIONS CONTROL CARD FOR ADMIN -->
      ${user.role === 'ADMIN' ? `
        <div class="card" style="margin-bottom: 2rem; background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); color: white; border: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <h3 style="margin: 0 0 0.4rem 0; font-size: 1.15rem; font-weight: 800; color: #F8FAFC;">
                Library Operations & QR Verification
              </h3>
              <p style="margin: 0; font-size: 0.85rem; color: #94A3B8;">
                Issue or return books instantly by scanning Student Digital ID QR Code or using manual search.
              </p>
            </div>

            <div style="display: flex; gap: 0.75rem;">
              <button class="btn-primary" onclick="LibraryView.openIssueBookModal()" style="background:#2563EB;">
                <i data-lucide="qr-code"></i> Issue Book (Scan QR / Search)
              </button>
              <button class="btn-secondary" onclick="LibraryView.openReturnBookModal()" style="background:rgba(255,255,255,0.1); color:white; border:1px solid rgba(255,255,255,0.2);">
                <i data-lucide="repeat"></i> Return Book
              </button>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- TOP SUMMARY CARDS -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-info">
            <h3>Currently Issued</h3>
            <div class="value">${activeIssued.length}</div>
            <span class="stat-trend positive">Active borrowings</span>
          </div>
          <div class="stat-icon blue">
            <i data-lucide="book-open"></i>
          </div>
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
          <div class="stat-icon ${overdueBooks.length > 0 ? 'red' : 'green'}">
            <i data-lucide="alert-triangle"></i>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-info">
            <h3>Total Fine</h3>
            <div class="value" style="color: ${totalFineAmount > 0 ? 'var(--color-warning)' : 'var(--color-success)'};">
              ₹${totalFineAmount}
            </div>
            <span class="stat-trend ${totalFineAmount > 0 ? 'warning' : 'positive'}">
              Outstanding library fines
            </span>
          </div>
          <div class="stat-icon ${totalFineAmount > 0 ? 'amber' : 'green'}">
            <i data-lucide="indian-rupee"></i>
          </div>
        </div>
      </div>

      <!-- SECTION 1: MY ISSUED BOOKS / ALL ISSUED RECORDS -->
      <div class="card" style="margin-bottom: 2rem;">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h3 class="card-title"><i data-lucide="book"></i> ${user.role === 'STUDENT' ? 'My Issued Books' : 'Issued Books Catalog'}</h3>
        </div>
        
        ${allRecords.length === 0 ? `
          <div style="padding: 2rem; text-align: center; color: var(--color-text-muted);">
            No books are currently issued.
          </div>
        ` : `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Author</th>
                  ${user.role !== 'STUDENT' ? `<th>Borrower</th>` : ''}
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Return Status</th>
                  <th>Fine</th>
                  ${user.role !== 'STUDENT' ? `<th>Action</th>` : ''}
                </tr>
              </thead>
              <tbody>
                ${allRecords.map(r => {
                  let statusClass = 'present';
                  if (r.returnStatus === 'OVERDUE') statusClass = 'danger';
                  if (r.returnStatus === 'RETURNED') statusClass = 'active';

                  const borrower = students.find(s => s.id === r.studentId || s.id === r.userId) || 
                                   facultyList.find(f => f.id === r.studentId || f.id === r.userId);

                  return `
                    <tr>
                      <td>
                        <strong>${r.bookName}</strong>
                        ${r.returnStatus === 'ISSUED' && r.dueIndicator === 'DUE SOON' ? `
                          <br><span style="font-size: 0.7rem; color: var(--color-warning); font-weight: 700;">⚠️ DUE SOON</span>
                        ` : ''}
                      </td>
                      <td>${r.author}</td>
                      ${user.role !== 'STUDENT' ? `
                        <td>
                          <strong>${borrower ? borrower.name : r.studentId}</strong>
                          <br><small style="color:var(--color-text-muted);">${borrower?.rollNo || borrower?.employeeNumber || 'ID Verified'}</small>
                        </td>
                      ` : ''}
                      <td>${this.formatDateDisplay(r.issueDate)}</td>
                      <td>${this.formatDateDisplay(r.dueDate)}</td>
                      <td>
                        <span class="status-badge ${statusClass}">${r.returnStatus}</span>
                      </td>
                      <td>${r.fineAmount > 0 ? `₹${r.fineAmount}` : '₹0'}</td>
                      ${user.role !== 'STUDENT' ? `
                        <td>
                          ${r.returnStatus !== 'RETURNED' ? `
                            <button class="btn-xs btn-secondary" onclick="LibraryView.processBookReturn('${r.id}')">
                              Return
                            </button>
                          ` : '<span style="color:var(--color-text-muted); font-size:0.8rem;">Returned</span>'}
                        </td>
                      ` : ''}
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <!-- SECTION 2: OVERDUE BOOKS -->
      <div class="card" style="margin-bottom: 2rem;">
        <div class="card-header">
          <h3 class="card-title" style="color: var(--color-danger);"><i data-lucide="alert-circle"></i> Overdue Books</h3>
        </div>
        
        ${overdueBooks.length === 0 ? `
          <div style="padding: 2rem; text-align: center; color: var(--color-success); font-weight: 500;">
            No overdue books.
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; padding: 1rem 0;">
            ${overdueBooks.map(b => `
              <div class="card" style="border: 1.5px solid var(--color-danger-border); background: var(--color-danger-bg); margin-bottom: 0;">
                <h4 style="color: var(--color-navy-dark); font-size: 1.1rem; margin-bottom: 0.5rem;">${b.bookName}</h4>
                <p style="font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 0.25rem;">Author: <strong>${b.author}</strong></p>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-top: 0.75rem; border-top: 1px dashed rgba(239, 68, 68, 0.2); padding-top: 0.5rem;">
                  <div>
                    <div>Issue: <strong>${this.formatDateDisplay(b.issueDate)}</strong></div>
                    <div>Due: <strong style="color: var(--color-danger);">${this.formatDateDisplay(b.dueDate)}</strong></div>
                  </div>
                  <div style="text-align: right;">
                    <div>Days Overdue: <strong style="color: var(--color-danger);">${b.daysOverdue}</strong></div>
                    <div>Fine: <strong style="color: var(--color-danger);">₹${b.fineAmount}</strong></div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

    `;
  },

  /**
   * Opens Issue Book Modal supporting [Search User] AND [Scan QR]
   */
  openIssueBookModal(preselectedUser = null) {
    const modalId = 'pams-issue-book-modal';
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const students = DataStore.get('STUDENTS') || [];
    const facultyList = DataStore.get('FACULTY') || [];
    const allUsers = [
      ...students.map(s => ({ id: s.id, name: s.name, type: 'STUDENT', label: `${s.name} (${s.rollNo || s.registrationNumber || s.id})` })),
      ...facultyList.map(f => ({ id: f.id, name: f.name, type: 'FACULTY', label: `${f.name} (${f.employeeNumber || f.id}) [Faculty]` }))
    ];

    const selectedUserId = preselectedUser ? preselectedUser.id : (allUsers[0] ? allUsers[0].id : '');
    const userStatus = selectedUserId ? LibraryService.getLibraryStatusForUser(selectedUserId) : null;

    const modalHtml = `
      <div id="${modalId}" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.8); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:999; padding:1rem;">
        
        <div style="background:white; border-radius:16px; width:520px; max-width:100%; box-shadow:0 20px 40px rgba(0,0,0,0.3); overflow:hidden; border:1px solid var(--color-border); animation:fadeIn 0.2s ease-out;">
          
          <div style="background:var(--color-navy-dark); color:white; padding:1.25rem 1.5rem; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:0.6rem;">
              <i data-lucide="book-plus" style="color:#60A5FA;"></i>
              <h3 style="margin:0; font-size:1.15rem; font-weight:800;">ISSUE BOOK TO BORROWER</h3>
            </div>
            <button onclick="document.getElementById('${modalId}').remove()" style="background:none; border:none; color:white; cursor:pointer; font-size:1.2rem;">✕</button>
          </div>

          <div style="padding:1.5rem;">
            
            <!-- DUAL OPTION HEADER: [ SEARCH USER ] & [ SCAN QR ] -->
            <div style="display:flex; gap:0.5rem; margin-bottom:1.25rem; background:#F1F5F9; padding:0.3rem; border-radius:10px;">
              <button id="issue-tab-search" class="btn-sm btn-primary" onclick="LibraryView.toggleIssueOption('search')" style="flex:1; justify-content:center; border-radius:8px;">
                <i data-lucide="search"></i> Search User
              </button>
              <button id="issue-tab-scan" class="btn-sm btn-secondary" onclick="LibraryView.startIssueQRScan()" style="flex:1; justify-content:center; border-radius:8px; background:white;">
                <i data-lucide="qr-code"></i> Scan Digital ID QR
              </button>
            </div>

            <!-- FORM -->
            <form onsubmit="LibraryView.submitIssueForm(event)">
              
              <!-- USER SELECTOR -->
              <div class="form-group" style="margin-bottom:1rem;">
                <label class="form-label">Select Borrower (Student or Faculty) *</label>
                <select id="issue-user-select" class="form-select" onchange="LibraryView.updateUserStatusDisplay(this.value)">
                  ${allUsers.map(u => `<option value="${u.id}" ${u.id === selectedUserId ? 'selected' : ''}>${u.label}</option>`).join('')}
                </select>
              </div>

              <!-- LIVE USER STATUS DISPLAY BOX -->
              <div id="issue-user-status-box" style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:0.85rem; margin-bottom:1.25rem;">
                ${this.renderUserStatusSnippet(selectedUserId)}
              </div>

              <div class="form-group" style="margin-bottom:1rem;">
                <label class="form-label">Book Title *</label>
                <input type="text" id="issue-book-name" class="form-input" placeholder="e.g. Data Structures & Algorithms" required>
              </div>

              <div class="form-group" style="margin-bottom:1.5rem;">
                <label class="form-label">Author Name *</label>
                <input type="text" id="issue-book-author" class="form-input" placeholder="e.g. Robert Lafore" required>
              </div>

              <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
                <button type="button" class="btn-secondary" onclick="document.getElementById('${modalId}').remove()">Cancel</button>
                <button type="submit" class="btn-primary"><i data-lucide="check"></i> Confirm & Issue Book</button>
              </div>

            </form>

          </div>

        </div>

      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (window.lucide) window.lucide.createIcons();
  },

  startIssueQRScan() {
    const existingModal = document.getElementById('pams-issue-book-modal');
    if (existingModal) existingModal.remove();

    QRScannerModal.open({
      onVerifySuccess: ({ user, type }) => {
        LibraryView.openIssueBookModal(user);
      },
      onManualSearch: () => {
        LibraryView.openIssueBookModal();
      }
    });
  },

  renderUserStatusSnippet(userId) {
    if (!userId) return `<span style="font-size:0.85rem; color:var(--color-text-muted);">Select a user to view library eligibility.</span>`;
    const status = LibraryService.getLibraryStatusForUser(userId);
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.82rem;">
        <div>
          <span>Currently Issued: <strong>${status.issuedCount} Books</strong></span> | 
          <span>Overdue: <strong style="color:${status.overdueCount > 0 ? '#DC2626' : '#16A34A'}">${status.overdueCount}</strong></span> | 
          <span>Fine: <strong>₹${status.totalFine}</strong></span>
        </div>
        <div>
          <span style="font-weight:700; color:${status.status === 'ELIGIBLE' ? '#16A34A' : '#DC2626'};">${status.statusText}</span>
        </div>
      </div>
    `;
  },

  updateUserStatusDisplay(userId) {
    const box = document.getElementById('issue-user-status-box');
    if (box) box.innerHTML = this.renderUserStatusSnippet(userId);
  },

  submitIssueForm(e) {
    e.preventDefault();
    const userId = document.getElementById('issue-user-select').value;
    const bookName = document.getElementById('issue-book-name').value;
    const author = document.getElementById('issue-book-author').value;

    try {
      LibraryService.issueBook({ userId, bookName, author });
      UIService.showToast(`Book "${bookName}" issued successfully!`, "success");
      const modal = document.getElementById('pams-issue-book-modal');
      if (modal) modal.remove();
      App.renderCurrentView();
    } catch (err) {
      UIService.showToast(err.message, "danger");
    }
  },

  /**
   * Opens Return Book Modal supporting [Search User] AND [Scan QR]
   */
  openReturnBookModal() {
    const modalId = 'pams-return-book-modal';
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const allRecords = LibraryService.getAllRecords().filter(r => r.returnStatus !== 'RETURNED');

    const modalHtml = `
      <div id="${modalId}" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.8); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:999; padding:1rem;">
        
        <div style="background:white; border-radius:16px; width:520px; max-width:100%; box-shadow:0 20px 40px rgba(0,0,0,0.3); overflow:hidden; border:1px solid var(--color-border); animation:fadeIn 0.2s ease-out;">
          
          <div style="background:var(--color-navy-dark); color:white; padding:1.25rem 1.5rem; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:0.6rem;">
              <i data-lucide="rotate-ccw" style="color:#60A5FA;"></i>
              <h3 style="margin:0; font-size:1.15rem; font-weight:800;">RETURN BOOK TO LIBRARY</h3>
            </div>
            <button onclick="document.getElementById('${modalId}').remove()" style="background:none; border:none; color:white; cursor:pointer; font-size:1.2rem;">✕</button>
          </div>

          <div style="padding:1.5rem;">
            
            <!-- DUAL OPTION HEADER: [ SEARCH USER ] & [ SCAN QR ] -->
            <div style="display:flex; gap:0.5rem; margin-bottom:1.25rem; background:#F1F5F9; padding:0.3rem; border-radius:10px;">
              <button class="btn-sm btn-primary" style="flex:1; justify-content:center; border-radius:8px;">
                <i data-lucide="search"></i> Select Issued Book
              </button>
              <button class="btn-sm btn-secondary" onclick="LibraryView.startReturnQRScan()" style="flex:1; justify-content:center; border-radius:8px; background:white;">
                <i data-lucide="qr-code"></i> Scan Digital ID QR
              </button>
            </div>

            ${allRecords.length === 0 ? `
              <div style="text-align:center; padding:2rem; color:var(--color-text-muted);">
                No active issued books found to return.
              </div>
            ` : `
              <div class="form-group" style="margin-bottom:1.5rem;">
                <label class="form-label">Select Issued Book Record *</label>
                <select id="return-record-select" class="form-select">
                  ${allRecords.map(r => `
                    <option value="${r.id}">"${r.bookName}" (Author: ${r.author}) — Issued to ${r.studentId}</option>
                  `).join('')}
                </select>
              </div>

              <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
                <button type="button" class="btn-secondary" onclick="document.getElementById('${modalId}').remove()">Cancel</button>
                <button type="button" class="btn-primary" onclick="LibraryView.submitReturnForm()"><i data-lucide="check"></i> Confirm Return</button>
              </div>
            `}

          </div>

        </div>

      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (window.lucide) window.lucide.createIcons();
  },

  startReturnQRScan() {
    const existingModal = document.getElementById('pams-return-book-modal');
    if (existingModal) existingModal.remove();

    QRScannerModal.open({
      onVerifySuccess: ({ user, type }) => {
        const userRecords = LibraryService.getAllRecords().filter(r => (r.studentId === user.id || r.userId === user.id) && r.returnStatus !== 'RETURNED');
        if (userRecords.length === 0) {
          UIService.showToast(`No active issued books found for ${user.name}.`, "info");
        }
        LibraryView.openReturnBookModal();
      },
      onManualSearch: () => {
        LibraryView.openReturnBookModal();
      }
    });
  },

  submitReturnForm() {
    const select = document.getElementById('return-record-select');
    if (!select || !select.value) return;

    this.processBookReturn(select.value);
    const modal = document.getElementById('pams-return-book-modal');
    if (modal) modal.remove();
  },

  processBookReturn(recordId) {
    UIService.showConfirm("Confirm Return", "Are you sure you want to process the return for this book?", () => {
      LibraryService.returnBook(recordId);
      UIService.showToast("Book returned successfully!", "success");
      App.renderCurrentView();
    });
  },

  formatDateDisplay(dateStr) {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = parts[0];
    const month = months[parseInt(parts[1], 10) - 1];
    const day = parts[2];
    return `${day} ${month} ${year}`;
  }
};

window.LibraryView = LibraryView;

/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - LIBRARY SETTINGS VIEW
   Canonical configuration dashboard for Librarian & Admin roles.
   Light sky-blue theme, responsive card layout, single source of truth.
   ========================================================================== */

const LibrarySettingsView = {
  loading: true,
  isDirty: false,
  settings: null,
  errorMessage: null,

  afterRender() {
    if (this.loading) {
      this.fetchSettings();
    } else {
      this.bindFormEvents();
    }
  },

  async fetchSettings() {
    this.errorMessage = null;
    try {
      if (window.LibrarySettingsService) {
        this.settings = await window.LibrarySettingsService.getSettings();
      } else {
        this.settings = {
          issuePeriodDays: 15,
          overdueFinePerDay: 2,
          reissueEnabled: true,
          returnRemindersEnabled: true,
          reminderDays: [13, 14, 15],
          newBookNotificationsEnabled: true,
          maxBooksPerStudent: 3
        };
      }
    } catch (err) {
      console.error("Failed to load library settings:", err);
      this.errorMessage = err.message || "Failed to fetch library settings.";
    } finally {
      this.loading = false;
      this.isDirty = false;
      if (window.App) window.App.renderCurrentView();
    }
  },

  bindFormEvents() {
    const form = document.getElementById('library-settings-form');
    if (!form) return;

    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('input', () => this.markDirty());
      input.addEventListener('change', () => this.markDirty());
    });

    if (window.lucide) window.lucide.createIcons();
  },

  markDirty() {
    if (!this.isDirty) {
      this.isDirty = true;
      const saveBtn = document.getElementById('save-settings-btn');
      const badge = document.getElementById('unsaved-badge');
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.style.opacity = '1';
        saveBtn.style.cursor = 'pointer';
      }
      if (badge) {
        badge.style.display = 'inline-flex';
      }
    }
  },

  async saveSettings() {
    const saveBtn = document.getElementById('save-settings-btn');
    if (saveBtn) saveBtn.disabled = true;

    try {
      const issuePeriodDays = parseInt(document.getElementById('set-issue-period').value, 10);
      const overdueFinePerDay = parseFloat(document.getElementById('set-overdue-fine').value);
      const maxBooksPerStudent = parseInt(document.getElementById('set-max-books').value, 10);
      const reissueEnabled = document.getElementById('set-reissue-enabled').checked;
      const returnRemindersEnabled = document.getElementById('set-reminders-enabled').checked;
      const newBookNotificationsEnabled = document.getElementById('set-new-book-notif-enabled').checked;

      const payload = {
        issuePeriodDays,
        overdueFinePerDay,
        maxBooksPerStudent,
        reissueEnabled,
        returnRemindersEnabled,
        reminderDays: [13, 14, 15],
        newBookNotificationsEnabled
      };

      if (window.LibrarySettingsService) {
        this.settings = await window.LibrarySettingsService.saveSettings(payload);
      }

      this.isDirty = false;
      if (window.UIService) {
        window.UIService.showToast("Library settings saved successfully.", "success");
      }

      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.style.opacity = '0.65';
        saveBtn.style.cursor = 'not-allowed';
      }
      const badge = document.getElementById('unsaved-badge');
      if (badge) badge.style.display = 'none';

      // Refresh top policy status text
      const statusText = document.getElementById('policy-status-summary');
      if (statusText) {
        statusText.innerText = `${this.settings.issuePeriodDays}-day issue period | ₹${this.settings.overdueFinePerDay}/day overdue fine | 3-day reminder window | New book notifications ${this.settings.newBookNotificationsEnabled ? 'enabled' : 'disabled'}`;
      }
    } catch (err) {
      console.error("Save settings failed:", err);
      if (window.UIService) {
        window.UIService.showToast(err.message || "Failed to save settings.", "danger");
      }
      if (saveBtn) saveBtn.disabled = false;
    }
  },

  resetToDefaults() {
    if (window.UIService) {
      window.UIService.showConfirm(
        "Reset to Defaults",
        "This will populate the form with standard institutional default values (15-day issue, ₹2/day fine, 3 books max). You must click 'Save Settings' to apply changes.",
        () => {
          document.getElementById('set-issue-period').value = 15;
          document.getElementById('set-overdue-fine').value = 2;
          document.getElementById('set-max-books').value = 3;
          document.getElementById('set-reissue-enabled').checked = true;
          document.getElementById('set-reminders-enabled').checked = true;
          document.getElementById('set-new-book-notif-enabled').checked = true;
          this.markDirty();
        }
      );
    }
  },

  render() {
    const user = window.authService ? window.authService.getCurrentUser() : null;

    // RBAC Security Check: Only LIBRARIAN and ADMIN can edit library settings
    if (!user || (user.role !== 'LIBRARIAN' && user.role !== 'ADMIN')) {
      return `
        <div class="page-header">
          <div>
            <h1>Library Settings</h1>
            <p>Institutional borrowing policies and configuration</p>
          </div>
        </div>
        <div class="card" style="padding: 4rem 2rem; text-align: center; border-color: #FECACA;">
          <div style="width:64px; height:64px; border-radius:50%; background:#FEE2E2; color:#DC2626; display:flex; align-items:center; justify-content:center; margin:0 auto 1.5rem auto; box-shadow:0 4px 12px rgba(220,38,38,0.15);">
            <i data-lucide="shield-alert" style="width:32px; height:32px;"></i>
          </div>
          <h2 style="color:#991B1B; font-weight:800; font-size:1.5rem; margin-bottom:0.5rem;">Access Restricted</h2>
          <p style="color:var(--color-text-muted); font-size:0.95rem; max-width:480px; margin:0 auto 1.5rem auto; line-height:1.6;">
            Library Settings are restricted to <strong>Librarian</strong> and <strong>Admin</strong> users only.
          </p>
          <button class="btn-primary" onclick="App.navigateTo('dashboard')" style="font-weight:700;">
            <i data-lucide="arrow-left"></i> Return to Dashboard
          </button>
        </div>
      `;
    }

    if (this.loading) {
      return `
        <div class="page-header">
          <div>
            <h1>Library Settings</h1>
            <p>Configure borrowing rules, overdue fines, reissue policies, and library notifications.</p>
          </div>
        </div>
        <div class="card" style="padding: 4rem; text-align: center;">
          <div style="display: inline-block; width: 36px; height: 36px; border: 3px solid #E2E8F0; border-top-color: #2563EB; border-radius: 50%; animation: spin 1s infinite linear;"></div>
          <p style="margin-top: 1rem; color: var(--color-text-muted); font-weight: 500;">Loading library configuration...</p>
        </div>
      `;
    }

    const cfg = this.settings || {
      issuePeriodDays: 15,
      overdueFinePerDay: 2,
      reissueEnabled: true,
      returnRemindersEnabled: true,
      reminderDays: [13, 14, 15],
      newBookNotificationsEnabled: true,
      maxBooksPerStudent: 3
    };

    return `
      <!-- PAGE HEADER -->
      <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;">
        <div>
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <div style="width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); color:white; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(37,99,235,0.25);">
              <i data-lucide="settings" style="width:20px; height:20px;"></i>
            </div>
            <h1 style="margin:0; font-size:1.6rem; font-weight:800; color:var(--color-navy-dark);">Library Settings</h1>
          </div>
          <p style="margin-top:0.4rem; color:var(--color-text-muted); font-size:0.9rem;">
            Configure borrowing rules, overdue fines, reissue policies, and library notifications.
          </p>
        </div>

        <div style="display:flex; align-items:center; gap:0.75rem;">
          <span id="unsaved-badge" class="status-badge warning" style="display:${this.isDirty ? 'inline-flex' : 'none'}; align-items:center; gap:0.35rem; font-size:0.8rem; font-weight:700; padding:0.4rem 0.75rem;">
            <i data-lucide="alert-circle" style="width:14px; height:14px;"></i> Unsaved Changes
          </span>
          <button type="button" class="btn-secondary" onclick="LibrarySettingsView.resetToDefaults()" style="font-weight:600; border-radius:8px;">
            <i data-lucide="rotate-ccw"></i> Reset to Default
          </button>
          <button type="button" id="save-settings-btn" class="btn-primary" onclick="LibrarySettingsView.saveSettings()" ${this.isDirty ? '' : 'disabled'} style="font-weight:700; border-radius:8px; opacity:${this.isDirty ? '1' : '0.65'}; cursor:${this.isDirty ? 'pointer' : 'not-allowed'}; box-shadow:0 4px 12px rgba(37,99,235,0.25);">
            <i data-lucide="save"></i> Save Settings
          </button>
        </div>
      </div>

      <!-- ACTIVE POLICY STATUS BANNER -->
      <div style="background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%); border: 1px solid #BFDBFE; border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 1.75rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#10B981; box-shadow:0 0 8px #10B981;"></span>
          <span style="font-weight:800; font-size:0.85rem; color:#1E3A8A; letter-spacing:0.5px; text-transform:uppercase;">Library Policy Status</span>
          <span style="color:#3B82F6;">•</span>
          <span style="font-weight:700; color:#1E40AF; font-size:0.88rem;">Active</span>
        </div>
        <div id="policy-status-summary" style="font-size:0.85rem; font-weight:600; color:#1E3A8A;">
          ${cfg.issuePeriodDays}-day issue period | ₹${cfg.overdueFinePerDay}/day overdue fine | 3-day reminder window | New book notifications ${cfg.newBookNotificationsEnabled ? 'enabled' : 'disabled'}
        </div>
      </div>

      <!-- SETTINGS FORM & CARDS GRID -->
      <form id="library-settings-form" onsubmit="event.preventDefault(); LibrarySettingsView.saveSettings();">
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">

          <!-- CARD 1: CIRCULATION RULES -->
          <div class="card" style="border-radius:16px; border:1px solid var(--color-border); box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); padding:1.75rem; background:white; display:flex; flex-direction:column; justify-space-between;">
            <div>
              <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.35rem;">
                <div style="width:32px; height:32px; border-radius:8px; background:#EFF6FF; color:#2563EB; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="book-open" style="width:18px; height:18px;"></i>
                </div>
                <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:var(--color-navy-dark);">📚 Circulation Rules</h3>
              </div>
              <p style="color:var(--color-text-muted); font-size:0.85rem; margin-bottom:1.5rem;">
                Configure how books are issued, returned, and renewed across the institution.
              </p>

              <!-- DEFAULT ISSUE PERIOD -->
              <div class="form-group" style="margin-bottom:1.25rem;">
                <label class="form-label" style="font-weight:700; font-size:0.88rem; color:var(--color-navy-dark); display:flex; justify-content:space-between;">
                  <span>Default Issue Period *</span>
                  <span style="color:#2563EB; font-weight:800;">15 Days (Institutional Policy)</span>
                </label>
                <div style="position:relative;">
                  <input type="number" id="set-issue-period" class="form-input" value="${cfg.issuePeriodDays}" min="1" max="15" step="1" required style="font-weight:700; font-size:1rem; padding-right:4.5rem; border-radius:8px;">
                  <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%); font-size:0.85rem; font-weight:700; color:var(--color-text-muted); pointer-events:none;">Days</span>
                </div>
                <div style="font-size:0.78rem; color:var(--color-text-muted); margin-top:0.35rem;">
                  Every book is issued for a maximum of 15 days. (Allowed range: 1 to 15 days).
                </div>
              </div>

              <!-- OVERDUE FINE -->
              <div class="form-group" style="margin-bottom:1.25rem;">
                <label class="form-label" style="font-weight:700; font-size:0.88rem; color:var(--color-navy-dark); display:flex; justify-content:space-between;">
                  <span>Overdue Fine Rate *</span>
                  <span style="color:#DC2626; font-weight:800;">₹${cfg.overdueFinePerDay} / day</span>
                </label>
                <div style="position:relative;">
                  <span style="position:absolute; left:12px; top:50%; transform:translateY(-50%); font-size:0.95rem; font-weight:800; color:var(--color-navy-dark); pointer-events:none;">₹</span>
                  <input type="number" id="set-overdue-fine" class="form-input" value="${cfg.overdueFinePerDay}" min="0" step="0.5" required style="font-weight:700; font-size:1rem; padding-left:2rem; border-radius:8px;">
                </div>
                <div style="font-size:0.78rem; color:var(--color-text-muted); margin-top:0.35rem;">
                  Fine starts from the day after the due date. (Calendar day calculation).
                </div>
              </div>

              <!-- MAX BOOKS PER STUDENT -->
              <div class="form-group" style="margin-bottom:1.25rem;">
                <label class="form-label" style="font-weight:700; font-size:0.88rem; color:var(--color-navy-dark);">
                  Maximum Books Per Student
                </label>
                <input type="number" id="set-max-books" class="form-input" value="${cfg.maxBooksPerStudent || 3}" min="1" max="10" step="1" required style="font-weight:700; font-size:1rem; border-radius:8px;">
                <div style="font-size:0.78rem; color:var(--color-text-muted); margin-top:0.35rem;">
                  Maximum active book borrowings allowed per student simultaneously.
                </div>
              </div>

              <!-- REISSUE TOGGLE -->
              <div style="background:#F8FAFC; border:1px solid var(--color-border); border-radius:10px; padding:1rem; margin-top:1rem; display:flex; align-items:center; justify-content:space-between;">
                <div>
                  <div style="font-weight:700; font-size:0.9rem; color:var(--color-navy-dark);">Allow Book Reissue</div>
                  <div style="font-size:0.78rem; color:var(--color-text-muted);">Allow eligible books to be reissued for another 15-day period</div>
                </div>
                <label style="position:relative; display:inline-block; width:44px; height:24px; cursor:pointer;">
                  <input type="checkbox" id="set-reissue-enabled" ${cfg.reissueEnabled !== false ? 'checked' : ''} style="opacity:0; width:0; height:0;">
                  <span class="toggle-slider" style="position:absolute; top:0; left:0; right:0; bottom:0; background-color:${cfg.reissueEnabled !== false ? '#2563EB' : '#CBD5E1'}; transition:.3s; border-radius:24px;">
                    <span style="position:absolute; content:''; height:18px; width:18px; left:${cfg.reissueEnabled !== false ? '22px' : '3px'}; bottom:3px; background-weight:bold; background-color:white; transition:.3s; border-radius:50%;"></span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          <!-- CARD 2: RETURN & REISSUE REMINDERS -->
          <div class="card" style="border-radius:16px; border:1px solid var(--color-border); box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); padding:1.75rem; background:white; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.35rem;">
                <div style="width:32px; height:32px; border-radius:8px; background:#FEF3C7; color:#D97706; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="bell" style="width:18px; height:18px;"></i>
                </div>
                <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:var(--color-navy-dark);">🔔 Return & Reissue Reminders</h3>
              </div>
              <p style="color:var(--color-text-muted); font-size:0.85rem; margin-bottom:1.5rem;">
                Notify students when their issued books are approaching the due date.
              </p>

              <!-- ENABLE REMINDERS CHECKBOX -->
              <div style="background:#F8FAFC; border:1px solid var(--color-border); border-radius:10px; padding:1rem; margin-bottom:1.25rem; display:flex; align-items:center; gap:0.75rem;">
                <input type="checkbox" id="set-reminders-enabled" ${cfg.returnRemindersEnabled !== false ? 'checked' : ''} style="width:18px; height:18px; accent-color:#2563EB; cursor:pointer;">
                <label for="set-reminders-enabled" style="font-weight:700; font-size:0.9rem; color:var(--color-navy-dark); cursor:pointer;">
                  Enable return & reissue reminders
                </label>
              </div>

              <!-- REMINDER SCHEDULE CHIPS -->
              <div style="margin-bottom:1.25rem;">
                <label class="form-label" style="font-weight:700; font-size:0.88rem; color:var(--color-navy-dark); margin-bottom:0.6rem; display:block;">
                  Official Reminder Schedule
                </label>
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:0.75rem;">
                  
                  <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:10px; padding:0.75rem 0.5rem; text-align:center;">
                    <div style="font-weight:800; color:#1E40AF; font-size:0.9rem;">Day 13</div>
                    <div style="font-size:0.75rem; color:#2563EB; font-weight:600; margin-top:2px;">2 days remaining</div>
                  </div>

                  <div style="background:#FEF3C7; border:1px solid #FCD34D; border-radius:10px; padding:0.75rem 0.5rem; text-align:center;">
                    <div style="font-weight:800; color:#92400E; font-size:0.9rem;">Day 14</div>
                    <div style="font-size:0.75rem; color:#D97706; font-weight:600; margin-top:2px;">1 day remaining</div>
                  </div>

                  <div style="background:#FEE2E2; border:1px solid #FCA5A5; border-radius:10px; padding:0.75rem 0.5rem; text-align:center;">
                    <div style="font-weight:800; color:#991B1B; font-size:0.9rem;">Day 15</div>
                    <div style="font-size:0.75rem; color:#DC2626; font-weight:600; margin-top:2px;">Due today</div>
                  </div>

                </div>
              </div>

              <!-- NOTIFICATION MESSAGE PREVIEWS -->
              <div>
                <label class="form-label" style="font-weight:700; font-size:0.85rem; color:var(--color-navy-dark); margin-bottom:0.5rem; display:block;">
                  Notification Message Preview
                </label>
                <div style="background:#F8FAFC; border:1px solid var(--color-border); border-radius:10px; padding:0.85rem; font-size:0.78rem; color:var(--color-text-dark); space-y-2;">
                  <div style="margin-bottom:0.5rem;">
                    <strong style="color:#1E40AF;">Day 13:</strong> <em>"Your library book '[Title]' is due in 2 days. Please return or reissue it before the due date."</em>
                  </div>
                  <div style="margin-bottom:0.5rem;">
                    <strong style="color:#D97706;">Day 14:</strong> <em>"Your library book '[Title]' is due tomorrow. Please return or reissue it before the due date."</em>
                  </div>
                  <div>
                    <strong style="color:#DC2626;">Day 15:</strong> <em>"Your library book '[Title]' is due today. Please return or reissue it today to avoid overdue fines."</em>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- CARD 3: NEW BOOK NOTIFICATIONS -->
          <div class="card" style="border-radius:16px; border:1px solid var(--color-border); box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); padding:1.75rem; background:white; display:flex; flex-direction:column; justify-space-between;">
            <div>
              <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.35rem;">
                <div style="width:32px; height:32px; border-radius:8px; background:#ECFDF5; color:#059669; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="book-plus" style="width:18px; height:18px;"></i>
                </div>
                <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:var(--color-navy-dark);">📖 New Book Notifications</h3>
              </div>
              <p style="color:var(--color-text-muted); font-size:0.85rem; margin-bottom:1.5rem;">
                Notify students whenever a new book is added to the library collection.
              </p>

              <!-- ENABLE NEW BOOK NOTIFICATIONS CHECKBOX -->
              <div style="background:#F8FAFC; border:1px solid var(--color-border); border-radius:10px; padding:1rem; margin-bottom:1.25rem; display:flex; align-items:center; gap:0.75rem;">
                <input type="checkbox" id="set-new-book-notif-enabled" ${cfg.newBookNotificationsEnabled !== false ? 'checked' : ''} style="width:18px; height:18px; accent-color:#059669; cursor:pointer;">
                <label for="set-new-book-notif-enabled" style="font-weight:700; font-size:0.9rem; color:var(--color-navy-dark); cursor:pointer;">
                  Notify students when a new book is released
                </label>
              </div>

              <!-- WORKFLOW CONFIRMATION PIPELINE -->
              <div style="background:#ECFDF5; border:1px solid #A7F3D0; border-radius:10px; padding:1rem;">
                <div style="font-weight:800; font-size:0.85rem; color:#065F46; margin-bottom:0.5rem; text-transform:uppercase; letter-spacing:0.5px;">
                  Notification Pipeline
                </div>
                <div style="display:flex; flex-direction:column; gap:0.5rem; font-size:0.8rem; color:#047857; font-weight:600;">
                  <div style="display:flex; align-items:center; gap:0.5rem;">
                    <i data-lucide="check-circle-2" style="width:16px; height:16px; color:#10B981;"></i>
                    <span>1. New book created & validated</span>
                  </div>
                  <div style="display:flex; align-items:center; gap:0.5rem;">
                    <i data-lucide="check-circle-2" style="width:16px; height:16px; color:#10B981;"></i>
                    <span>2. Firestore book write succeeds</span>
                  </div>
                  <div style="display:flex; align-items:center; gap:0.5rem;">
                    <i data-lucide="check-circle-2" style="width:16px; height:16px; color:#10B981;"></i>
                    <span>3. Broadcast notification dispatched to students</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- CARD 4: REISSUE POLICY DETAILS -->
          <div class="card" style="border-radius:16px; border:1px solid var(--color-border); box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); padding:1.75rem; background:white; display:flex; flex-direction:column; justify-space-between;">
            <div>
              <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.35rem;">
                <div style="width:32px; height:32px; border-radius:8px; background:#F3E8FF; color:#7E22CE; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="rotate-cw" style="width:18px; height:18px;"></i>
                </div>
                <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:var(--color-navy-dark);">🔄 Reissue Policy Details</h3>
              </div>
              <p style="color:var(--color-text-muted); font-size:0.85rem; margin-bottom:1.5rem;">
                A successful book reissue starts a fresh 15-day lending period.
              </p>

              <div style="background:#FAF5FF; border:1px solid #E9D5FF; border-radius:10px; padding:1rem;">
                <div style="font-weight:800; font-size:0.85rem; color:#6B21A8; margin-bottom:0.75rem; text-transform:uppercase; letter-spacing:0.5px;">
                  Reissue Lifecycle Example
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; font-size:0.8rem;">
                  <div style="background:white; border:1px solid #F3E8FF; border-radius:8px; padding:0.6rem;">
                    <div style="font-weight:700; color:#7E22CE;">Original Issue</div>
                    <div style="color:var(--color-text-muted); margin-top:2px;">Issued: 01 September</div>
                    <div style="font-weight:700; color:#1E40AF; margin-top:2px;">Due: 15 September</div>
                  </div>

                  <div style="background:white; border:1px solid #F3E8FF; border-radius:8px; padding:0.6rem;">
                    <div style="font-weight:700; color:#059669;">After Reissue</div>
                    <div style="color:var(--color-text-muted); margin-top:2px;">Reissued: 15 September</div>
                    <div style="font-weight:700; color:#059669; margin-top:2px;">New Due: 30 September</div>
                  </div>
                </div>
                <div style="font-size:0.75rem; color:#7E22CE; margin-top:0.75rem; font-style:italic;">
                  * Historical issue records and original due dates are preserved in transaction history.
                </div>
              </div>
            </div>
          </div>

        </div>
      </form>
    `;
  }
};

window.LibrarySettingsView = LibrarySettingsView;
window.LibSettingsView = LibrarySettingsView;

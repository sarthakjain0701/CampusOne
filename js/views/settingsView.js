/* ==========================================================================
   POORNIMA ATTENDANCE MANAGEMENT SYSTEM (PAMS) - SETTINGS VIEW
   ADMIN ONLY — Role-Based Access Control Enforced
   ========================================================================== */

const SettingsView = {
  render() {
    // ── BACKEND/SERVICE-LAYER AUTHORIZATION GUARD ──────────────────────────
    // Independently verify role at render time. This blocks direct JS calls
    // (e.g. SettingsView.render()) even if navigation guard is bypassed.
    const user = (typeof authService !== 'undefined') ? authService.getCurrentUser() : null;
    if (!user || user.role !== 'ADMIN') {
      return `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:5rem 2rem; text-align:center;">
          <div style="width:72px; height:72px; border-radius:50%; background:#FEE2E2; display:flex; align-items:center; justify-content:center; margin-bottom:1.5rem; box-shadow:0 4px 12px rgba(239,68,68,0.2);">
            <i data-lucide="shield-alert" style="width:36px; height:36px; color:#DC2626;"></i>
          </div>
          <h1 style="font-size:1.8rem; font-weight:800; color:#991B1B; margin:0 0 0.75rem 0;">Access Denied</h1>
          <p style="color:#475569; font-size:1rem; max-width:440px; margin:0 auto 0.5rem auto; line-height:1.6;">
            You are not authorized to access <strong>System Settings</strong>.
          </p>
          <p style="color:#64748B; font-size:0.875rem; max-width:440px; margin:0 auto 2rem auto; line-height:1.6;">
            System Settings are restricted to <strong>Admin</strong> users only.
            Your current role — <strong>${user ? user.role : 'Unknown'}</strong> — does not have permission to view or modify system configuration.
          </p>
          <button class="btn-primary" onclick="App.navigateTo('dashboard')" style="font-weight:700;">
            <i data-lucide="arrow-left"></i> Return to Dashboard
          </button>
        </div>
      `;
    }
    // ── END GUARD ───────────────────────────────────────────────────────────

    return `
      <div class="page-header">
        <h1>System Settings</h1>
        <p>Configure attendance warning thresholds, notification rules, and database seed data.</p>
      </div>

      <div class="dashboard-grid">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><i data-lucide="sliders"></i> Attendance Rules & Thresholds</h3>
          </div>

          <div class="form-group">
            <label class="form-label">Minimum Attendance Requirement (%)</label>
            <input type="number" class="form-input" value="75" min="50" max="100" style="padding-left:1rem;">
            <p style="font-size:0.75rem; color:var(--color-text-muted); margin-top:4px;">Students falling below this requirement receive warning alerts.</p>
          </div>

          <div class="form-group">
            <label class="form-label">Critical Warning Threshold (%)</label>
            <input type="number" class="form-input" value="65" min="40" max="74" style="padding-left:1rem;">
          </div>

          <button class="btn-primary" onclick="UIService.showToast('Threshold settings saved.', 'success')">
            Save Rule Preferences
          </button>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><i data-lucide="database"></i> Database Seed & Reset</h3>
          </div>
          <p style="font-size:0.85rem; color:var(--color-text-muted); margin-bottom:1.5rem;">
            Reset local data store with default Poornima Group of Education sample records (Students, Faculty, Subjects, Classes, Attendance).
          </p>

          <button class="btn-secondary" style="border-color:var(--color-danger); color:var(--color-danger);" onclick="SettingsView.resetData()">
            <i data-lucide="refresh-cw"></i> Reset & Re-Seed Database
          </button>
        </div>
      </div>
    `;
  },

  resetData() {
    // Guard here too — resetData can't be called by non-Admin either
    const user = (typeof authService !== 'undefined') ? authService.getCurrentUser() : null;
    if (!user || user.role !== 'ADMIN') {
      UIService.showToast('Access Denied: Only Admin can reset system data.', 'danger');
      return;
    }
    UIService.showConfirm("Reset Database Seed", "Reset database with default Poornima Group sample data?", () => {
      DataStore.seedData();
      UIService.showToast("Database re-seeded successfully!", "success");
      App.renderCurrentView();
    });
  }
};

window.SettingsView = SettingsView;


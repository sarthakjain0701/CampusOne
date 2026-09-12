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
          <button class="btn-primary" onclick="App.navigateTo('dashboard')" >
            <i data-lucide="arrow-left"></i> Return to Dashboard
          </button>
        </div>
      `;
    }
    // ── END GUARD ───────────────────────────────────────────────────────────

    return `
      <div class="page-header">
        <h1>System Settings</h1>
        <p>Configure attendance warning thresholds, notification rules, database seed data, and system migrations.</p>
      </div>

      <div class="form-grid-3">
        <div class="form-card">
          <div class="form-section-title" style="border-bottom:none; margin-bottom:1rem; padding-bottom:0;"><i data-lucide="sliders"></i> Attendance Rules & Thresholds</div>

          <div class="form-group">
            <label class="form-label">Minimum Attendance Requirement (%)</label>
            <input type="number" class="form-input" value="75" min="50" max="100">
            <p style="font-size:0.75rem; color:var(--color-text-muted); margin-top:4px;">Students falling below this requirement receive warning alerts.</p>
          </div>

          <div class="form-group">
            <label class="form-label">Critical Warning Threshold (%)</label>
            <input type="number" class="form-input" value="65" min="40" max="74">
          </div>

          <button class="btn-primary" onclick="UIService.showToast('Threshold settings saved.', 'success')" style="width:100%;">
            Save Rule Preferences
          </button>
        </div>

        <div class="form-card">
          <div class="form-section-title" style="border-bottom:none; margin-bottom:1rem; padding-bottom:0;"><i data-lucide="database"></i> Reference Data Migration</div>
          <p style="font-size:0.85rem; color:var(--color-text-muted); margin-bottom:1.5rem;">
            Safely migrate baseline static reference data (Subjects, Classes, Departments) to authoritative Firestore collections.
            This action is idempotent and conflict-safe.
          </p>

          <button id="btn-run-migration" class="btn-secondary" onclick="SettingsView.runReferenceMigration()" style="width:100%;">
            <i data-lucide="server"></i> Run Live Migration
          </button>
        </div>

        <div class="form-card" style="border: 1px solid var(--color-danger-bg);">
          <div class="form-section-title" style="border-bottom:none; margin-bottom:1rem; padding-bottom:0; color:var(--color-danger);"><i data-lucide="alert-triangle"></i> Database Seed & Reset</div>
          <p style="font-size:0.85rem; color:var(--color-text-muted); margin-bottom:1.5rem;">
            Reset local data store with default Poornima Group of Education sample records (Students, Faculty, Subjects, Classes, Attendance).
          </p>

          <button class="btn-danger" onclick="SettingsView.resetData()" style="width:100%;">
            <i data-lucide="refresh-cw"></i> Reset & Re-Seed Database
          </button>
        </div>
      </div>
    `;
  },

  async runReferenceMigration() {
    const user = (typeof authService !== 'undefined') ? authService.getCurrentUser() : null;
    if (!user || user.role !== 'ADMIN') {
      UIService.showToast('Access Denied: Only Admin can run migration.', 'danger');
      return;
    }

    UIService.showConfirm("Run Reference Data Migration", "Are you sure you want to run the Firestore Reference Data Migration? This action is conflict-safe.", async () => {
      const btn = document.getElementById('btn-run-migration');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="lucide lucide-loader"></i> Migrating...';
      }

      try {
        if (!window.ReferenceMigrationService) {
          throw new Error("ReferenceMigrationService is not loaded.");
        }
        
        const result = await window.ReferenceMigrationService.runMigration();
        
        if (result.status === 'SUCCESS') {
          const r = result.report;
          const details = `
            Subjects: ${r.subjects.created} created, ${r.subjects.existing} existing, ${r.subjects.errors} errors.\n
            Classes: ${r.classes.created} created, ${r.classes.existing} existing, ${r.classes.errors} errors.\n
            Departments: ${r.departments.created} created, ${r.departments.existing} existing, ${r.departments.errors} errors.\n
            Conflicts: ${r.conflicts.length}
          `;
          alert("Migration Completed Successfully!\n" + details);
          UIService.showToast("Migration completed successfully.", "success");
        } else {
          alert("Migration Failed:\n" + result.message);
          UIService.showToast("Migration failed.", "danger");
        }
      } catch (e) {
        console.error(e);
        alert("Migration Error: " + e.message);
        UIService.showToast("Migration error occurred.", "danger");
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<i data-lucide="server"></i> Run Live Migration';
          if (window.lucide) window.lucide.createIcons();
        }
      }
    });
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


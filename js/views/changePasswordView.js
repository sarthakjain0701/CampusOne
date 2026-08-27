/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - CHANGE PASSWORD VIEW
   Forces user to change password on first login.
   ========================================================================== */

const ChangePasswordView = {
  render() {
    return `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:5rem 2rem; max-width: 500px; margin: 0 auto; text-align:center;">
        <div style="width:72px; height:72px; border-radius:50%; background:#FEF3C7; display:flex; align-items:center; justify-content:center; margin-bottom:1.5rem; box-shadow:0 4px 12px rgba(245,158,11,0.2);">
          <i data-lucide="key" style="width:36px; height:36px; color:#D97706;"></i>
        </div>
        <h1 style="font-size:1.8rem; font-weight:800; color:var(--color-navy-dark); margin:0 0 0.75rem 0;">Update Password Required</h1>
        <p style="color:#475569; font-size:0.95rem; margin:0 auto 2rem auto; line-height:1.6;">
          For security reasons, you must change your default password before accessing the portal.
        </p>

        <form id="change-pwd-form" onsubmit="ChangePasswordView.handleSubmit(event)" style="width: 100%; text-align: left;">
          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label class="form-label" for="new-password">New Password</label>
            <input type="password" id="new-password" class="form-input" style="padding-left: 1rem;" required minlength="6" placeholder="Enter a secure password">
            <p style="font-size: 0.75rem; color: #64748B; margin-top: 4px;">Password must be at least 6 characters long.</p>
          </div>

          <div class="form-group" style="margin-bottom: 2rem;">
            <label class="form-label" for="confirm-password">Confirm Password</label>
            <input type="password" id="confirm-password" class="form-input" style="padding-left: 1rem;" required minlength="6" placeholder="Confirm your new password">
          </div>

          <button type="submit" id="btn-pwd-submit" class="btn-primary" style="width: 100%; justify-content: center;">
            <i data-lucide="check-circle"></i> Save & Continue
          </button>
        </form>
      </div>
    `;
  },

  async handleSubmit(event) {
    event.preventDefault();
    const newPwd = document.getElementById('new-password').value;
    const confirmPwd = document.getElementById('confirm-password').value;
    const btn = document.getElementById('btn-pwd-submit');

    if (newPwd !== confirmPwd) {
      UIService.showToast("Passwords do not match.", "danger");
      return;
    }

    if (!window.FirebaseService || !window.FirebaseService.auth || !window.FirebaseService.db) {
      UIService.showToast("Firebase services are offline.", "danger");
      return;
    }

    const authUser = window.FirebaseService.auth.currentUser;
    if (!authUser) {
      UIService.showToast("Authentication session lost. Please log in again.", "danger");
      App.logout();
      return;
    }

    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader" class="spin"></i> UPDATING...`;
    if (window.lucide) window.lucide.createIcons();

    try {
      // 1. Update Firebase Auth Password
      await authUser.updatePassword(newPwd);

      // 2. Update Firestore mustChangePassword flag
      const currentUser = authService.getCurrentUser();
      let collectionName = '';
      if (currentUser.role === 'STUDENT') collectionName = 'authorizedUsers';
      if (currentUser.role === 'FACULTY' || currentUser.role === 'LAB_ASSISTANT' || currentUser.role === 'LIBRARIAN') collectionName = 'faculties';
      if (currentUser.role === 'ADMIN') collectionName = 'admins';

      await window.FirebaseService.db.collection(collectionName).doc(currentUser.email).update({
        mustChangePassword: false,
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
      });

      // 3. Update local session state
      currentUser.mustChangePassword = false;
      window.DataStore.setCurrentUser(currentUser);
      localStorage.setItem('pas_session_user', JSON.stringify(currentUser));

      UIService.showToast("Password updated successfully!", "success");
      App.navigateTo('dashboard');
    } catch (err) {
      console.error(err);
      UIService.showToast(err.message || "Failed to update password.", "danger");
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="check-circle"></i> Save & Continue`;
      if (window.lucide) window.lucide.createIcons();
    }
  }
};

window.ChangePasswordView = ChangePasswordView;

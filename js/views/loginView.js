/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - LOGIN VIEW (PHASE 5 SERVICE-CONNECTED)
   Supports a single, universal login screen for all roles.
   ========================================================================== */

const LoginView = {
  showPassword: false,

  render() {
    return `
      <div class="login-page">
        <!-- CENTERED FORM SECTION -->
        <div class="login-content">
          <div class="login-card">
            <div class="login-header">
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 1rem; gap: 0.5rem;">
                <img src="https://www.poornima.org/img/emblem.png" alt="Poornima Group Of College Logo" style="height: 90px; width: auto; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); margin-bottom: 0.5rem;">
                <div style="font-size: 1.5rem; font-weight: 900; color: #FFFFFF; letter-spacing: 1px; text-align: center; text-shadow: 0 2px 10px rgba(0,0,0,0.5); line-height: 1.2; margin-top: 0.5rem; text-transform: uppercase;">Poornima Group Of College</div>
              </div>
              <p style="font-weight: 600; color: rgba(255, 255, 255, 0.9); font-size: 0.95rem; margin-bottom: 0.25rem; text-align: center; text-shadow: 0 1px 4px rgba(0,0,0,0.4);">Smart Attendance. Better Management. Better Education.</p>
            </div>

            <form id="login-form" onsubmit="LoginView.handleSubmit(event)">
              <div class="form-group">
                <label class="form-label" for="login-email">College Email Address</label>
                <div class="input-container">
                  <i data-lucide="mail" class="input-icon"></i>
                  <input type="email" id="login-email" class="form-input" placeholder="name@poornima.org" required value="">
                </div>
              </div>

              <div class="form-group" id="password-group">
                <label class="form-label" for="login-password">Password</label>
                <div class="input-container">
                  <i data-lucide="lock" class="input-icon"></i>
                  <input type="${this.showPassword ? 'text' : 'password'}" id="login-password" class="form-input" placeholder="••••••••" required>
                  <button type="button" class="toggle-password" onclick="LoginView.togglePasswordVisibility()" aria-label="Toggle password visibility">
                    <i data-lucide="${this.showPassword ? 'eye-off' : 'eye'}"></i>
                  </button>
                </div>
              </div>

              <button type="submit" id="btn-login-submit" class="btn-primary" style="width: 100%; margin-top: 1rem;">
                LOG IN
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    const input = document.getElementById('login-password');
    if (input) {
      input.type = this.showPassword ? 'text' : 'password';
    }
  },

  async handleSubmit(event) {
    event.preventDefault();
    
    const btn = document.getElementById('btn-login-submit');
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader" class="spin"></i> LOGGING IN...`;
    if (window.lucide) window.lucide.createIcons();

    try {
      // Connect to authService (role is auto-detected on backend)
      const user = await window.authService.login(email, password);
      UIService.showToast(`Welcome back, ${user.name}!`, 'success');
      window.App.onLoginSuccess(user);
    } catch (err) {
      UIService.showToast(err.message, 'danger');
      btn.disabled = false;
      btn.innerHTML = `LOG IN`;
      if (window.lucide) window.lucide.createIcons();
    }
  }
};

window.LoginView = LoginView;

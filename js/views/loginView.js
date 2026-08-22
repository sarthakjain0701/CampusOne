/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - LOGIN VIEW (PHASE 5 SERVICE-CONNECTED)
   ========================================================================== */

const LoginView = {
  selectedRole: 'ADMIN',
  showPassword: false,

  render() {
    return `
      <div class="login-container">
        <!-- CENTERED FORM SECTION -->
        <div class="login-form-wrapper">
          <div class="login-card">
            <div class="login-header">
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 1.5rem; gap: 0.5rem;">
                <img src="https://www.poornima.org/img/emblem.png" alt="Poornima College Logo" style="height: 100px; width: auto; object-fit: contain;">
                <div style="font-size: 1.5rem; font-weight: 800; color: #FFFFFF; letter-spacing: 1px; text-align: center;">POORNIMA GROUP OF COLLEGES</div>
              </div>
              <p style="font-weight: 600; color: var(--color-primary); margin-top: 2px;">WELCOME BACK</p>
            </div>

            <!-- Role Selector Tabs -->
            <div class="role-tabs">
              <button type="button" class="role-tab ${this.selectedRole === 'ADMIN' ? 'active' : ''}" onclick="LoginView.setRole('ADMIN')">
                <i data-lucide="shield"></i> Admin
              </button>
              <button type="button" class="role-tab ${this.selectedRole === 'FACULTY' ? 'active' : ''}" onclick="LoginView.setRole('FACULTY')">
                <i data-lucide="user"></i> Faculty
              </button>
              <button type="button" class="role-tab ${this.selectedRole === 'STUDENT' ? 'active' : ''}" onclick="LoginView.setRole('STUDENT')">
                <i data-lucide="graduation-cap"></i> Student
              </button>
            </div>

            <form id="login-form" onsubmit="LoginView.handleSubmit(event)">
              <div class="form-group">
                <label class="form-label" for="login-email">College Email Address</label>
                <div class="input-container">
                  <i data-lucide="mail" class="input-icon"></i>
                  <input type="email" id="login-email" class="form-input" placeholder="name@poornima.org" required value="${this.getDefaultEmail()}">
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

  getDefaultEmail() {
    if (this.selectedRole === 'ADMIN') return 'admin@poornima.org';
    if (this.selectedRole === 'FACULTY') return 'faculty@poornima.org';
    return 'student@poornima.org';
  },

  setRole(role) {
    this.selectedRole = role;
    const emailInput = document.getElementById('login-email');
    if (emailInput) emailInput.value = this.getDefaultEmail();
    
    document.querySelectorAll('.role-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.innerText.toUpperCase().includes(role)) {
        tab.classList.add('active');
      }
    });

    const passwordGroup = document.getElementById('password-group');
    const loginSubmitBtn = document.getElementById('btn-login-submit');

    if (passwordGroup) passwordGroup.style.display = 'block';
    if (loginSubmitBtn) loginSubmitBtn.style.display = 'inline-flex';
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
      // Connect to authService
      const user = await window.authService.login(email, password, this.selectedRole);
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

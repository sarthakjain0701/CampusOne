/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - LOGIN VIEW (PHASE 5 SERVICE-CONNECTED)
   Supports a single, universal login screen for all roles.
   ========================================================================== */

const LoginView = {
  showPassword: false,

  render() {
    return `
      <div class="login-page">

        <!-- DECORATIVE BLOBS (behind content) -->
        <div class="login-blob login-blob-1"></div>
        <div class="login-blob login-blob-2"></div>

        <!-- TWO-COLUMN WRAPPER -->
        <div class="login-layout">

          <!-- ===== LEFT SIDE — BRANDING ===== -->
          <div class="login-branding">

            <!-- Logo + College Name -->
            <div class="login-brand-header">
              <img src="https://www.poornima.org/img/emblem.png" alt="Poornima Group Of College Logo" class="login-brand-logo">
              <div>
                <div class="login-brand-name">POORNIMA GROUP OF<br>COLLEGE</div>
                <div class="login-brand-tagline">Smart Attendance. Better Management. Better Education.</div>
              </div>
            </div>

            <!-- Main Headline -->
            <div class="login-headline">
              <div class="login-headline-dark">Education Builds</div>
              <div class="login-headline-gradient">a Brighter Future</div>
            </div>

            <!-- Supporting Text -->
            <div class="login-supporting">
              <p>Learn today, lead tomorrow.</p>
              <p>Empowering minds for a better tomorrow.</p>
            </div>

            <!-- Feature Highlights -->
            <div class="login-features">
              <div class="login-feature-item">
                <div class="login-feature-icon">
                  <i data-lucide="graduation-cap"></i>
                </div>
                <div class="login-feature-text">Quality<br>Education</div>
              </div>
              <div class="login-feature-divider"></div>
              <div class="login-feature-item">
                <div class="login-feature-icon">
                  <i data-lucide="users"></i>
                </div>
                <div class="login-feature-text">Experienced<br>Faculty</div>
              </div>
              <div class="login-feature-divider"></div>
              <div class="login-feature-item">
                <div class="login-feature-icon">
                  <i data-lucide="trending-up"></i>
                </div>
                <div class="login-feature-text">Holistic<br>Development</div>
              </div>
            </div>

            <!-- Closing Quote -->
            <div class="login-quote">
              <span>Together Towards Excellence</span>
              <div class="login-quote-line"></div>
            </div>

          </div>
          <!-- ===== END LEFT SIDE ===== -->

          <!-- ===== RIGHT SIDE — LOGIN CARD ===== -->
          <div class="login-panel-wrapper">
            <div class="login-card">

              <!-- Card Header -->
              <div class="login-header">
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 0.75rem; gap: 0.5rem;">
                  <img src="https://www.poornima.org/img/emblem.png" alt="Poornima Group Of College Logo" style="height: 72px; width: auto; object-fit: contain; filter: drop-shadow(0 2px 8px rgba(30,64,175,0.25)); margin-bottom: 0.25rem;">
                  <div style="font-size: 1.15rem; font-weight: 900; color: #1E3A8A; letter-spacing: 0.5px; text-align: center; line-height: 1.25; text-transform: uppercase;">Poornima Group Of College</div>
                </div>
                <p style="font-weight: 500; color: #64748B; font-size: 0.85rem; margin-bottom: 0; text-align: center;">Smart Attendance. Better Management. Better Education.</p>
              </div>

              <!-- Form -->
              <form id="login-form" onsubmit="LoginView.handleSubmit(event)">
                <div class="form-group">
                  <label class="form-label login-label" for="login-email">College Email Address</label>
                  <div class="input-container">
                    <i data-lucide="mail" class="input-icon"></i>
                    <input type="email" id="login-email" class="form-input login-input" placeholder="name@poornima.org" required value="">
                  </div>
                </div>

                <div class="form-group" id="password-group">
                  <label class="form-label login-label" for="login-password">Password</label>
                  <div class="input-container">
                    <i data-lucide="lock" class="input-icon"></i>
                    <input type="${this.showPassword ? 'text' : 'password'}" id="login-password" class="form-input login-input" placeholder="••••••••" required>
                    <button type="button" class="toggle-password login-toggle-pw" onclick="LoginView.togglePasswordVisibility()" aria-label="Toggle password visibility">
                      <i data-lucide="${this.showPassword ? 'eye-off' : 'eye'}"></i>
                    </button>
                  </div>
                </div>

                <button type="submit" id="btn-login-submit" class="btn-primary login-btn" style="width: 100%; margin-top: 1rem;">
                  LOG IN &nbsp;→
                </button>
              </form>

            </div>
          </div>
          <!-- ===== END RIGHT SIDE ===== -->

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

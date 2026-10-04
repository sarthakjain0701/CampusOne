/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - LOGIN VIEW (PHASE 5 SERVICE-CONNECTED)
   Supports a single, universal login screen for all roles.
   ========================================================================== */

const LoginView = {
  showPassword: false,

  render() {
    return `
      <div class="login-page">

        <!-- DECORATIVE BLOBS (behind content) are handled in CSS, keep structure -->
        <div class="login-blob login-blob-1"></div>
        <div class="login-blob login-blob-2"></div>

        <!-- TWO-COLUMN WRAPPER -->
        <div class="login-layout">

          <!-- ===== LEFT SIDE — BRANDING ===== -->
          <div class="login-branding">

            <!-- Logo -->
            <div class="login-brand-header">
              <!-- Using a generic asset path for the provided logo -->
              <img src="assets/logo/CampusOne_Logo.png" alt="CampusOne Logo" class="login-brand-logo" onerror="this.src='https://www.poornima.org/img/emblem.png'">
            </div>

            <!-- Main Headline -->
            <div class="login-headline">
              <div class="login-headline-dark">Learn Today,</div>
              <div class="login-headline-gradient">Lead Tomorrow</div>
            </div>

            <!-- Supporting Text -->
            <div class="login-supporting">
              <p>Empowering students, faculty and staff with a</p>
              <p>smarter, simpler and more connected learning experience.</p>
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
              <div class="login-header" style="text-align: left;">
                <div style="display: flex; justify-content: center; margin-bottom: 2rem;">
                  <img src="assets/logo/CampusOne_Logo.png" alt="CampusOne Logo" style="height: 60px; width: auto; object-fit: contain;" onerror="this.src='https://www.poornima.org/img/emblem.png'">
                </div>
                <h1 style="text-align: left; margin-bottom: 0.5rem; color: #1E3A8A; font-size: 1.75rem;">Welcome Back!</h1>
                <p style="text-align: left; color: #64748B; font-size: 0.9rem; line-height: 1.4; margin-bottom: 2rem;">Sign in to access your dashboard and continue your learning journey.</p>
              </div>

              <!-- Form -->
              <form id="login-form" onsubmit="LoginView.handleSubmit(event)">
                <div class="form-group" style="margin-bottom: 1.25rem;">
                  <label class="form-label login-label" for="login-email" style="text-align: left; display: block; margin-bottom: 0.5rem; color: #1E3A8A;">Email Address</label>
                  <div class="input-container" style="position: relative;">
                    <i data-lucide="mail" class="input-icon" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #3B82F6;"></i>
                    <input type="email" id="login-email" class="form-input login-input" placeholder="name@poornima.org" required value="" style="width: 100%; padding-left: 2.75rem; padding-right: 1rem; height: 48px; border-radius: 8px; border: 1px solid #E2E8F0;">
                  </div>
                </div>

                <div class="form-group" id="password-group" style="margin-bottom: 1.5rem;">
                  <label class="form-label login-label" for="login-password" style="text-align: left; display: block; margin-bottom: 0.5rem; color: #1E3A8A;">Password</label>
                  <div class="input-container" style="position: relative;">
                    <i data-lucide="lock" class="input-icon" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #3B82F6;"></i>
                    <input type="password" id="login-password" class="form-input login-input" placeholder="••••••••" required style="width: 100%; padding-left: 2.75rem; padding-right: 3rem; height: 48px; border-radius: 8px; border: 1px solid #E2E8F0;">
                    <button type="button" id="toggle-pw-btn" class="toggle-password login-toggle-pw" onclick="LoginView.togglePasswordVisibility()" aria-label="Show password" style="position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: #3B82F6; cursor: pointer; display: flex; align-items: center; justify-content: center; height: 100%; padding: 0 0.25rem;">
                      <i data-lucide="eye" id="toggle-pw-icon"></i>
                    </button>
                  </div>
                </div>

                <button type="submit" id="btn-login-submit" class="btn-primary login-btn" style="width: 100%; height: 48px; border-radius: 8px; margin-top: 0.5rem; margin-bottom: 1.5rem; font-size: 1rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                  LOG IN <i data-lucide="arrow-right" style="width: 18px; height: 18px;"></i>
                </button>
                
                <div style="text-align: center; margin-bottom: 1.5rem;">
                  <a href="#" style="color: #3B82F6; font-size: 0.9rem; font-weight: 500; text-decoration: none;">Forgot Password?</a>
                </div>
              </form>

              <!-- Security Indicators -->
              <div style="border-top: 1px solid #E2E8F0; padding-top: 1.25rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: #64748B; font-size: 0.75rem; font-weight: 500;">
                <i data-lucide="shield-check" style="width: 14px; height: 14px; color: #3B82F6;"></i>
                <span>Secure &bull; Trusted &bull; Always</span>
              </div>

            </div>
          </div>
          <!-- ===== END RIGHT SIDE ===== -->

        </div>
      </div>
    `;
  },

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    const input = document.getElementById("login-password");
    const btn = document.getElementById("toggle-pw-btn");
    if (input && btn) {
      input.type = this.showPassword ? "text" : "password";
      btn.setAttribute(
        "aria-label",
        this.showPassword ? "Hide password" : "Show password",
      );
      // Update icon dynamically
      btn.innerHTML = `<i data-lucide="${this.showPassword ? "eye-off" : "eye"}" id="toggle-pw-icon"></i>`;
      if (window.lucide) {
        window.lucide.createIcons({
          root: btn,
        });
      }
    }
  },

  async handleSubmit(event) {
    event.preventDefault();

    const btn = document.getElementById("btn-login-submit");
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader" class="spin"></i> LOGGING IN...`;
    if (window.lucide) window.lucide.createIcons();

    try {
      // Connect to authService (role is auto-detected on backend)
      const user = await window.authService.login(email, password);
      UIService.showToast(`Welcome back, ${user.name}!`, "success");
      window.App.onLoginSuccess(user);
    } catch (err) {
      UIService.showToast(err.message, "danger");
      btn.disabled = false;
      btn.innerHTML = `LOG IN`;
      if (window.lucide) window.lucide.createIcons();
    }
  },
};

window.LoginView = LoginView;

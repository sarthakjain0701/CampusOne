/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAMS) - QR SCANNER MODAL COMPONENT
   Camera Stream & QR Verification Scanner for Library & Verification Flows
   ========================================================================== */

const QRScannerModal = {
  currentStream: null,
  scanCallback: null,
  fallbackManualCallback: null,

  /**
   * Opens the QR Scanner Modal
   * @param {Object} options { onVerifySuccess, onManualSearch }
   */
  open(options = {}) {
    this.scanCallback = options.onVerifySuccess || null;
    this.fallbackManualCallback = options.onManualSearch || null;

    this.renderScannerUI();
    this.initCameraStream();
  },

  close() {
    this.stopCameraStream();
    const modalEl = document.getElementById('pams-qr-modal');
    if (modalEl) modalEl.remove();
  },

  stopCameraStream() {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = null;
    }
  },

  renderScannerUI() {
    this.close(); // remove existing if any

    const modalHtml = `
      <div id="pams-qr-modal" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.85); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:9999; padding:1rem;">
        
        <div style="background:white; border-radius:16px; width:480px; max-width:100%; box-shadow:0 25px 50px -12px rgba(0,0,0,0.4); overflow:hidden; border:1px solid var(--color-border); animation:fadeIn 0.2s ease-out;">
          
          <!-- HEADER -->
          <div style="background:var(--color-navy-dark); color:white; padding:1.25rem 1.5rem; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:0.6rem;">
              <i data-lucide="qr-code" style="color:#60A5FA;"></i>
              <h3 style="margin:0; font-size:1.15rem; font-weight:800; letter-spacing:0.5px;">SCAN DIGITAL ID</h3>
            </div>
            <button onclick="QRScannerModal.close()" style="background:none; border:none; color:rgba(255,255,255,0.7); cursor:pointer; font-size:1.2rem; display:flex; align-items:center;" title="Close">
              <i data-lucide="x"></i>
            </button>
          </div>

          <!-- BODY -->
          <div style="padding:1.5rem; text-align:center;">
            
            <!-- CAMERA DISPLAY CONTAINER -->
            <div id="qr-camera-container" style="position:relative; width:100%; height:240px; background:#0F172A; border-radius:12px; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; border:2px dashed rgba(59,130,246,0.5);">
              
              <video id="qr-video" autoplay playsinline style="width:100%; height:100%; object-fit:cover; display:none;"></video>
              
              <!-- SCANNER OVERLAY GRAPHIC -->
              <div id="qr-scanner-overlay" style="display:flex; flex-direction:column; align-items:center; justify-content:center; color:white; padding:1rem;">
                <div style="width:140px; height:140px; border:3px solid #60A5FA; border-radius:12px; position:relative; display:flex; align-items:center; justify-content:center; box-shadow:0 0 20px rgba(96,165,250,0.4);">
                  <div style="position:absolute; width:100%; height:2px; background:#60A5FA; top:50%; animation:scanline 2s infinite linear; box-shadow:0 0 8px #60A5FA;"></div>
                  <i data-lucide="camera" style="width:40px; height:40px; color:rgba(255,255,255,0.4);"></i>
                </div>
                <p id="camera-status-text" style="font-size:0.85rem; color:#94A3B8; margin-top:0.85rem; margin-bottom:0;">Requesting camera access...</p>
              </div>

            </div>

            <p style="font-size:0.9rem; font-weight:600; color:var(--color-navy-dark); margin-top:1rem; margin-bottom:0.25rem;">
              Point the camera at the Digital ID QR code.
            </p>
            <p style="font-size:0.8rem; color:var(--color-text-muted); margin-bottom:1.25rem;">
              Position the QR code inside the frame for automatic detection.
            </p>

            <!-- DIRECT TEST SIMULATION BAR -->
            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:0.75rem; margin-bottom:1.25rem; text-align:left;">
              <div style="font-size:0.75rem; font-weight:700; color:var(--color-navy-dark); text-transform:uppercase; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.4rem;">
                <i data-lucide="sparkles" style="width:14px; height:14px; color:#2563EB;"></i> Direct Test Scan Simulation:
              </div>
              <div style="display:flex; flex-wrap:wrap; gap:0.4rem;">
                <button class="btn-xs" onclick="QRScannerModal.processScan('PAMS|STUDENT|REG-2026-001')" style="background:#E0F2FE; color:#0369A1; border:1px solid #BAE6FD; padding:0.35rem 0.6rem; border-radius:6px; font-weight:600; font-size:0.75rem; cursor:pointer;">
                  Rahul (Student)
                </button>
                <button class="btn-xs" onclick="QRScannerModal.processScan('PAMS|STUDENT|REG-2026-002')" style="background:#E0F2FE; color:#0369A1; border:1px solid #BAE6FD; padding:0.35rem 0.6rem; border-radius:6px; font-weight:600; font-size:0.75rem; cursor:pointer;">
                  Priya (Student)
                </button>
                <button class="btn-xs" onclick="QRScannerModal.processScan('PAMS|FACULTY|EMP-FAC-101')" style="background:#EEF2FF; color:#4338CA; border:1px solid #C7D2FE; padding:0.35rem 0.6rem; border-radius:6px; font-weight:600; font-size:0.75rem; cursor:pointer;">
                  Dr. Rajesh (Faculty)
                </button>
                <button class="btn-xs" onclick="QRScannerModal.processScan('PAMS|STUDENT|REG-2026-006')" style="background:#FEF2F2; color:#991B1B; border:1px solid #FCA5A5; padding:0.35rem 0.6rem; border-radius:6px; font-weight:600; font-size:0.75rem; cursor:pointer;">
                  Inactive User
                </button>
                <button class="btn-xs" onclick="QRScannerModal.processScan('INVALID_QR_SAMPLE')" style="background:#F1F5F9; color:#475569; border:1px solid #CBD5E1; padding:0.35rem 0.6rem; border-radius:6px; font-weight:600; font-size:0.75rem; cursor:pointer;">
                  Invalid QR
                </button>
              </div>
            </div>

            <!-- MANUAL QR CODE TEXT INPUT FALLBACK -->
            <div style="display:flex; gap:0.5rem; margin-bottom:1.25rem;">
              <input type="text" id="manual-qr-input" class="form-input" placeholder="Or enter QR string e.g. PAMS|STUDENT|REG-2026-001" style="font-size:0.85rem;" onkeypress="if(event.key==='Enter') QRScannerModal.processScan(this.value)">
              <button class="btn-primary" onclick="QRScannerModal.processScan(document.getElementById('manual-qr-input').value)" style="white-space:nowrap;">
                Scan QR
              </button>
            </div>

          </div>

          <!-- FOOTER BUTTONS -->
          <div style="background:#F8FAFC; padding:1rem 1.5rem; border-top:1px solid var(--color-border); display:flex; justify-content:space-between; align-items:center;">
            <button class="btn-secondary" onclick="QRScannerModal.close()">
              Cancel
            </button>
            <button class="btn-secondary" onclick="QRScannerModal.triggerManualSearch()">
              <i data-lucide="search"></i> Search User Manually
            </button>
          </div>

        </div>

      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (window.lucide) window.lucide.createIcons();
  },

  async initCameraStream() {
    const video = document.getElementById('qr-video');
    const statusText = document.getElementById('camera-status-text');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (statusText) statusText.innerHTML = "<span style='color:#FCA5A5;'>Camera permission is required to scan the QR code.<br>Use simulation buttons below.</span>";
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      this.currentStream = stream;
      if (video) {
        video.srcObject = stream;
        video.style.display = 'block';
        if (statusText) statusText.textContent = "Camera active — scanning frame...";
      }
    } catch (err) {
      console.warn("Camera Stream Permission Denied/Unavailable:", err);
      if (statusText) {
        statusText.innerHTML = "<span style='color:#FCA5A5;'>Camera permission is required to scan the QR code.<br>Use simulation buttons below.</span>";
      }
    }
  },

  triggerManualSearch() {
    this.close();
    if (typeof this.fallbackManualCallback === 'function') {
      this.fallbackManualCallback();
    }
  },

  /**
   * Evaluates scanned QR code payload and routes to appropriate result screen
   */
  processScan(qrString) {
    if (!qrString || !qrString.trim()) {
      UIService.showToast("Please enter a valid QR code string.", "warning");
      return;
    }

    this.stopCameraStream();
    const result = QRService.identifyUser(qrString.trim());

    if (result.status === 'INVALID' || result.status === 'NOT_FOUND') {
      this.renderInvalidQRModal(result.error);
    } else if (result.status === 'INACTIVE') {
      this.renderInactiveModal(result.user, result.type);
    } else if (result.success && result.status === 'ACTIVE') {
      this.renderVerifiedUserModal(result.user, result.type);
    }
  },

  renderInvalidQRModal(errorMsg) {
    this.close();

    const html = `
      <div id="pams-qr-modal" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.85); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:9999; padding:1rem;">
        <div style="background:white; border-radius:16px; width:440px; max-width:100%; box-shadow:0 25px 50px -12px rgba(0,0,0,0.4); padding:2rem; text-align:center; animation:fadeIn 0.2s ease-out;">
          
          <div style="width:64px; height:64px; background:#FEF2F2; color:#DC2626; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1.25rem; font-size:2rem; font-weight:800; border:2px solid #FCA5A5;">
            ✕
          </div>

          <h3 style="font-size:1.35rem; font-weight:800; color:#991B1B; margin-bottom:0.5rem; letter-spacing:-0.5px;">
            INVALID QR CODE
          </h3>

          <p style="font-size:0.9rem; color:var(--color-text-muted); line-height:1.5; margin-bottom:1.75rem;">
            ${errorMsg || 'This QR code is not recognized by Poornima Attendance System.'}
          </p>

          <div style="display:flex; justify-content:center; gap:0.75rem;">
            <button class="btn-primary" onclick="QRScannerModal.open({ onVerifySuccess: QRScannerModal.scanCallback, onManualSearch: QRScannerModal.fallbackManualCallback })">
              Try Again
            </button>
            <button class="btn-secondary" onclick="QRScannerModal.close()">
              Cancel
            </button>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
  },

  renderInactiveModal(user, type) {
    this.close();

    const name = user ? user.name : "User";

    const html = `
      <div id="pams-qr-modal" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.85); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:9999; padding:1rem;">
        <div style="background:white; border-radius:16px; width:440px; max-width:100%; box-shadow:0 25px 50px -12px rgba(0,0,0,0.4); padding:2rem; text-align:center; animation:fadeIn 0.2s ease-out;">
          
          <div style="width:64px; height:64px; background:#FFFBEB; color:#D97706; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1.25rem; font-size:2rem; font-weight:800; border:2px solid #FDE68A;">
            ⚠️
          </div>

          <h3 style="font-size:1.35rem; font-weight:800; color:#B45309; margin-bottom:0.5rem;">
            ID INACTIVE
          </h3>

          <p style="font-size:0.95rem; font-weight:700; color:var(--color-navy-dark); margin-bottom:0.25rem;">
            ${name} (${type})
          </p>

          <p style="font-size:0.9rem; color:var(--color-text-muted); line-height:1.5; margin-bottom:1.75rem;">
            This Digital ID is currently inactive.<br>The requested operation cannot continue.
          </p>

          <div style="display:flex; justify-content:center;">
            <button class="btn-secondary" onclick="QRScannerModal.open({ onVerifySuccess: QRScannerModal.scanCallback, onManualSearch: QRScannerModal.fallbackManualCallback })">
              Back
            </button>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
  },

  renderVerifiedUserModal(user, type) {
    this.close();

    const libStatus = LibraryService.getLibraryStatusForUser(user.id);
    const isStudent = type === 'STUDENT';

    const html = `
      <div id="pams-qr-modal" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.85); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:9999; padding:1rem;">
        
        <div style="background:white; border-radius:18px; width:480px; max-width:100%; box-shadow:0 25px 50px -12px rgba(0,0,0,0.4); overflow:hidden; border:1px solid var(--color-border); animation:fadeIn 0.2s ease-out;">
          
          <!-- VERIFIED BANNER -->
          <div style="background:linear-gradient(90deg, #15803D 0%, #16A34A 100%); color:white; padding:1.25rem 1.5rem; text-align:center;">
            <div style="font-size:1.4rem; font-weight:900; letter-spacing:1px; display:flex; align-items:center; justify-content:center; gap:0.5rem;">
              <span>✓</span> ${isStudent ? 'USER VERIFIED' : 'FACULTY VERIFIED'}
            </div>
            <div style="font-size:0.75rem; font-weight:700; color:rgba(255,255,255,0.85); text-transform:uppercase; margin-top:2px;">
              PAMS DIGITAL ID VERIFIED
            </div>
          </div>

          <!-- USER INFO PROFILE CARD -->
          <div style="padding:1.5rem;">
            
            <div style="display:flex; gap:1.25rem; align-items:center; margin-bottom:1.25rem; padding-bottom:1rem; border-bottom:1px solid var(--color-border);">
              <div style="width:72px; height:84px; background:linear-gradient(135deg, #1E293B, #334155); border-radius:10px; color:white; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:2rem; flex-shrink:0; border:2px solid #22C55E;">
                ${user.name.charAt(0)}
              </div>
              
              <div style="flex:1;">
                <h3 style="font-size:1.2rem; font-weight:800; color:var(--color-navy-dark); margin:0 0 0.25rem 0;">${user.name}</h3>
                <div style="display:inline-block; background:#DCFCE7; color:#15803D; font-size:0.72rem; font-weight:800; padding:0.2rem 0.6rem; border-radius:12px; margin-bottom:0.4rem;">
                  ${type}
                </div>
                <div style="font-size:0.8rem; color:var(--color-text-muted);">${user.email}</div>
              </div>
            </div>

            <!-- DETAILS GRID -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.6rem 1rem; font-size:0.85rem; margin-bottom:1.25rem;">
              <div>
                <span style="color:var(--color-text-muted); font-size:0.75rem; display:block;">Registration / Faculty ID</span>
                <strong style="color:var(--color-navy-dark);">${user.registrationNumber || user.employeeNumber || user.rollNo || user.id}</strong>
              </div>

              <div>
                <span style="color:var(--color-text-muted); font-size:0.75rem; display:block;">Department</span>
                <strong style="color:var(--color-navy-dark);">${user.department || 'Computer Science'}</strong>
              </div>

              ${isStudent ? `
                <div>
                  <span style="color:var(--color-text-muted); font-size:0.75rem; display:block;">Section</span>
                  <strong style="color:var(--color-navy-dark);">${user.section || 'A'}</strong>
                </div>

                <div>
                  <span style="color:var(--color-text-muted); font-size:0.75rem; display:block;">Batch</span>
                  <strong style="color:var(--color-navy-dark);">${user.batch || '2024–2028'}</strong>
                </div>
              ` : `
                <div>
                  <span style="color:var(--color-text-muted); font-size:0.75rem; display:block;">Designation</span>
                  <strong style="color:var(--color-navy-dark);">${user.designation || 'Faculty Member'}</strong>
                </div>
              `}
            </div>

            <!-- LIBRARY STATUS SUMMARY IN VERIFIED CARD -->
            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:1rem; margin-bottom:1.25rem;">
              <div style="font-size:0.8rem; font-weight:700; color:var(--color-navy-dark); text-transform:uppercase; margin-bottom:0.6rem;">
                Library Status Summary
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.5rem; text-align:center; font-size:0.8rem;">
                <div>
                  <div style="color:var(--color-text-muted); font-size:0.7rem;">Currently Issued</div>
                  <strong style="font-size:1.1rem; color:#2563EB;">${libStatus.issuedCount} Books</strong>
                </div>
                <div>
                  <div style="color:var(--color-text-muted); font-size:0.7rem;">Overdue</div>
                  <strong style="font-size:1.1rem; color:${libStatus.overdueCount > 0 ? '#DC2626' : '#16A34A'};">${libStatus.overdueCount} Books</strong>
                </div>
                <div>
                  <div style="color:var(--color-text-muted); font-size:0.7rem;">Fine</div>
                  <strong style="font-size:1.1rem; color:${libStatus.totalFine > 0 ? '#D97706' : '#16A34A'};">₹${libStatus.totalFine}</strong>
                </div>
              </div>
              <div style="margin-top:0.6rem; pt:0.5rem; border-top:1px dashed #CBD5E1; font-size:0.8rem; font-weight:700; display:flex; justify-content:space-between; align-items:center;">
                <span>Library Access Status:</span>
                <span style="color:${libStatus.status === 'ELIGIBLE' ? '#16A34A' : '#DC2626'};">${libStatus.statusText}</span>
              </div>
            </div>

            <!-- CONTINUE ACTION BUTTON -->
            <button class="btn-primary" style="width:100%; justify-content:center; padding:0.85rem; font-weight:700; font-size:0.95rem;" onclick="QRScannerModal.confirmVerification('${user.id}', '${type}')">
              Continue
            </button>

          </div>

        </div>

      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    if (window.lucide) window.lucide.createIcons();

    // Cache verified user info
    this.verifiedUser = user;
    this.verifiedType = type;
  },

  confirmVerification(userId, type) {
    const user = this.verifiedUser;
    this.close();
    if (typeof this.scanCallback === 'function') {
      this.scanCallback({ user, type });
    }
  }
};

window.QRScannerModal = QRScannerModal;

/* ==========================================================================
   POORNIMA ATTENDANCE MANAGEMENT SYSTEM (PAMS) - UI SERVICE
   Universal UI helpers: Toasts, Modals, Confirmation Dialogs, Skeleton Loaders
   ========================================================================== */

const UIService = {
  showToast(message, type = 'info', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'danger') iconName = 'alert-circle';
    if (type === 'warning') iconName = 'alert-triangle';

    toast.innerHTML = `
      <i data-lucide="${iconName}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  openModal(title, contentHtml, footerButtons = []) {
    let backdrop = document.getElementById('global-modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'global-modal-backdrop';
      backdrop.className = 'modal-backdrop';
      backdrop.innerHTML = `
        <div class="modal-card">
          <div class="modal-header">
            <h3 id="modal-title">Modal Title</h3>
            <button class="btn-close-modal" onclick="UIService.closeModal()">&times;</button>
          </div>
          <div class="modal-body" id="modal-body"></div>
          <div class="modal-footer" id="modal-footer"></div>
        </div>
      `;
      document.body.appendChild(backdrop);
    }

    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-body').innerHTML = contentHtml;

    const footerEl = document.getElementById('modal-footer');
    footerEl.innerHTML = '';
    
    if (footerButtons.length === 0) {
      footerEl.innerHTML = `<button class="btn-secondary" onclick="UIService.closeModal()">Close</button>`;
    } else {
      footerButtons.forEach(btn => {
        const b = document.createElement('button');
        b.className = btn.className || 'btn-primary';
        b.innerText = btn.text;
        b.onclick = () => {
          if (btn.onClick) btn.onClick();
        };
        footerEl.appendChild(b);
      });
    }

    backdrop.classList.add('active');
    if (window.lucide) window.lucide.createIcons();
  },

  closeModal() {
    const backdrop = document.getElementById('global-modal-backdrop');
    if (backdrop) backdrop.classList.remove('active');
  },

  showConfirm(title, message, onConfirm) {
    this.openModal(
      title,
      `<p style="color: var(--color-navy-dark); font-size: 0.95rem;">${message}</p>`,
      [
        { text: 'Cancel', className: 'btn-secondary', onClick: () => this.closeModal() },
        { text: 'Confirm', className: 'btn-primary', onClick: () => { this.closeModal(); onConfirm(); } }
      ]
    );
  },

  getSkeletonLoader(type = 'table') {
    if (type === 'cards') {
      return `
        <div class="stats-grid">
          ${[1, 2, 3, 4].map(() => `
            <div class="stat-card" style="opacity: 0.6; animation: pulse 1.5s infinite;">
              <div class="stat-info" style="width: 100%;">
                <div style="height: 14px; width: 60%; background: #E2E8F0; border-radius: 4px; margin-bottom: 12px;"></div>
                <div style="height: 28px; width: 40%; background: #CBD5E1; border-radius: 6px;"></div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
    return `
      <div style="padding: 2rem; text-align: center; color: var(--color-text-muted);">
        <div style="display: inline-block; width: 36px; height: 36px; border: 3px solid #E2E8F0; border-top-color: #2563EB; border-radius: 50%; animation: spin 1s infinite linear;"></div>
        <p style="margin-top: 1rem; font-size: 0.9rem; font-weight: 500;">Loading data from database...</p>
        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
      </div>
    `;
  }
};

window.UIService = UIService;

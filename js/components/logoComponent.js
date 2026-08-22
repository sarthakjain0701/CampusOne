/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - CENTRAL LOGO COMPONENT
   Single source of truth for branding across Sidebar, Navbar, Login, & Views
   ========================================================================== */

const LogoComponent = {
  render({ variant = 'full', theme = 'dark', size = 'medium', className = '' } = {}) {
    const textColor = theme === 'dark' ? '#FFFFFF' : '#0F172A';
    const subtextColor = theme === 'dark' ? '#93C5FD' : '#2563EB';

    // Standalone Image
    const imgSrc = "https://www.poornima.org/img/emblem.png";
    const imgStyle = "width: 100%; height: 100%; object-fit: contain;";
    const imageElement = `<img src="${imgSrc}" alt="Poornima Logo" style="${imgStyle}">`;

    if (variant === 'icon') {
      return `
        <div class="pas-logo-icon-wrapper ${className}" style="width: 42px; height: 42px; flex-shrink: 0;">
          ${imageElement}
        </div>
      `;
    }

    if (variant === 'navbar') {
      return `
        <div class="pas-logo-navbar ${className}" style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 36px; height: 36px; flex-shrink: 0;">${imageElement}</div>
          <div class="pas-logo-text" style="display: flex; flex-direction: column; line-height: 1.1;">
            <span style="font-size: 1.05rem; font-weight: 800; color: ${textColor}; letter-spacing: 0.5px;">POORNIMA</span>
            <span style="font-size: 0.65rem; font-weight: 700; color: ${subtextColor}; letter-spacing: 1.5px; text-transform: uppercase;">GROUP OF COLLEGES</span>
          </div>
        </div>
      `;
    }

    // Default 'full' variant (Used in Sidebar & Login Page)
    const iconSize = size === 'large' ? '64px' : '42px';
    const titleSize = size === 'large' ? '1.5rem' : '1.15rem';
    const subSize = size === 'large' ? '0.75rem' : '0.65rem';

    return `
      <div class="pas-logo-full ${className}" style="display: flex; align-items: center; gap: 12px;">
        <div style="width: ${iconSize}; height: ${iconSize}; flex-shrink: 0;">${imageElement}</div>
        <div class="pas-logo-text" style="display: flex; flex-direction: column; line-height: 1.15;">
          <span style="font-size: ${titleSize}; font-weight: 800; color: ${textColor}; letter-spacing: 0.8px;">POORNIMA</span>
          <span style="font-size: ${subSize}; font-weight: 700; color: ${subtextColor}; letter-spacing: 2px; text-transform: uppercase;">GROUP OF COLLEGES</span>
        </div>
      </div>
    `;
  }
};

window.LogoComponent = LogoComponent;

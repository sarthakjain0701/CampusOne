/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - LAB PROBLEM REPORT VIEW
   Allows Lab Assistants to report issues.
   ========================================================================== */

const LabProblemReportView = {
  isSubmitting: false,

  afterRender() {
    // Add event listeners if needed
  },

  async submitReport(event) {
    event.preventDefault();
    if (this.isSubmitting) return;

    const form = document.getElementById('labProblemForm');
    const formData = new FormData(form);

    const payload = {
      laboratoryName: formData.get('laboratoryName'),
      category: formData.get('category'),
      title: formData.get('title'),
      description: formData.get('description'),
      priority: formData.get('priority')
    };

    if (!payload.laboratoryName || !payload.category || !payload.title || !payload.description) {
      if (typeof uiService !== 'undefined') {
        uiService.showToast('Please fill out all required fields.', 'error');
      } else {
        alert('Please fill out all required fields.');
      }
      return;
    }

    this.isSubmitting = true;
    const btn = document.getElementById('submitReportBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="loader-2" style="animation: spin 1s infinite linear;"></i> Submitting...';
    btn.disabled = true;

    try {
      if (typeof LabProblemService === 'undefined') throw new Error("Service not loaded.");
      
      await LabProblemService.createReport(payload);
      
      if (typeof uiService !== 'undefined') {
        uiService.showToast('Problem report submitted successfully.', 'success');
      } else {
        alert('Problem report submitted successfully.');
      }
      
      App.navigateTo('my-lab-reports');
    } catch (err) {
      console.error(err);
      if (typeof uiService !== 'undefined') {
        uiService.showToast(err.message || 'Failed to submit report.', 'error');
      } else {
        alert(err.message || 'Failed to submit report.');
      }
      
      btn.innerHTML = originalText;
      btn.disabled = false;
      this.isSubmitting = false;
      if (window.lucide) window.lucide.createIcons();
    }
  },

  render() {
    const categoriesOptions = LabProblemService.CATEGORIES.map(c => `<option value="${c.id}">${c.label}</option>`).join('');
    const prioritiesOptions = LabProblemService.PRIORITIES.map(p => `<option value="${p.id}">${p.label}</option>`).join('');

    return `
      <div class="page-header" style="margin-bottom: 2rem;">
        <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--color-navy-dark); margin-bottom: 0.25rem;">
          Report a Laboratory Problem
        </h1>
        <p style="color: var(--color-text-muted); font-size: 1rem;">
          Submit details about broken equipment, network issues, or maintenance needs.
        </p>
      </div>

      <div class="glass-panel" style="padding: 2.5rem; max-width: 800px; margin: 0 auto;">
        <form id="labProblemForm" onsubmit="LabProblemReportView.submitReport(event)" style="display: flex; flex-direction: column; gap: 1.5rem;">
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
            <!-- Laboratory Room -->
            <div class="form-group">
              <label style="font-size: 0.85rem; font-weight: 700; color: var(--color-navy-dark); margin-bottom: 0.5rem; display: block;">Laboratory / Room <span style="color:#DC2626">*</span></label>
              <input type="text" name="laboratoryName" class="form-control" placeholder="e.g., CS Lab 3, Network Lab" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-border-light); border-radius: 8px; font-family: 'Inter', sans-serif;">
            </div>

            <!-- Category -->
            <div class="form-group">
              <label style="font-size: 0.85rem; font-weight: 700; color: var(--color-navy-dark); margin-bottom: 0.5rem; display: block;">Problem Category <span style="color:#DC2626">*</span></label>
              <select name="category" class="form-control" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-border-light); border-radius: 8px; background: white; font-family: 'Inter', sans-serif;">
                <option value="">Select a category...</option>
                ${categoriesOptions}
              </select>
            </div>
          </div>

          <!-- Problem Title -->
          <div class="form-group">
            <label style="font-size: 0.85rem; font-weight: 700; color: var(--color-navy-dark); margin-bottom: 0.5rem; display: block;">Problem Title <span style="color:#DC2626">*</span></label>
            <input type="text" name="title" class="form-control" placeholder="Short description of the issue..." required style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-border-light); border-radius: 8px; font-family: 'Inter', sans-serif;">
          </div>

          <!-- Priority -->
          <div class="form-group">
            <label style="font-size: 0.85rem; font-weight: 700; color: var(--color-navy-dark); margin-bottom: 0.5rem; display: block;">Priority <span style="color:#DC2626">*</span></label>
            <select name="priority" class="form-control" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-border-light); border-radius: 8px; background: white; font-family: 'Inter', sans-serif;">
              ${prioritiesOptions}
            </select>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label style="font-size: 0.85rem; font-weight: 700; color: var(--color-navy-dark); margin-bottom: 0.5rem; display: block;">Detailed Description <span style="color:#DC2626">*</span></label>
            <textarea name="description" class="form-control" rows="5" placeholder="Provide as much detail as possible..." required style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-border-light); border-radius: 8px; font-family: 'Inter', sans-serif; resize: vertical;"></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; padding-top: 1.5rem; border-top: 1px solid var(--color-border-light);">
            <button type="button" class="btn-secondary" onclick="App.navigateTo('dashboard')" style="padding: 0.75rem 1.5rem;">Cancel</button>
            <button type="submit" id="submitReportBtn" class="btn-primary" style="padding: 0.75rem 1.5rem; background: var(--poornima-blue); display: flex; align-items: center; gap: 0.5rem;">
              <i data-lucide="send" style="width: 18px; height: 18px;"></i>
              Submit Report
            </button>
          </div>
        </form>
      </div>
      
      <style>
        .form-control:focus { outline: none; border-color: var(--poornima-blue); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
      </style>
    `;
  }
};

window.LabProblemReportView = LabProblemReportView;

/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - BULK IMPORT MODAL
   Manages the UI lifecycle for importing Excel data (Upload -> Preview -> Confirm)
   ========================================================================== */

const BulkImportModal = {
  state: {
    type: 'STUDENT', // 'STUDENT' | 'FACULTY'
    step: 1, // 1: Upload, 2: Preview, 3: Success
    file: null,
    records: [],
    filterStatus: 'ALL',
    searchQuery: '',
    stats: {
      total: 0,
      valid: 0,
      invalid: 0,
      duplicate: 0
    }
  },

  open(type) {
    this.state = {
      type: type,
      step: 1,
      file: null,
      records: [],
      filterStatus: 'ALL',
      searchQuery: '',
      stats: { total: 0, valid: 0, invalid: 0, duplicate: 0 }
    };
    this.render();
  },

  close() {
    UIService.closeModal();
  },

  render() {
    const title = this.state.type === 'STUDENT' ? 'Import Students from Excel' : 'Import Faculty from Excel';
    
    let content = '';
    let buttons = [];

    if (this.state.step === 1) {
      content = this._renderUploadStep();
      buttons = [
        { text: 'Cancel', className: 'btn-secondary', onClick: () => this.close() },
        { 
          text: 'Validate File', 
          className: 'btn-primary', 
          onClick: () => this.processFile(),
          disabled: !this.state.file
        }
      ];
    } else if (this.state.step === 2) {
      content = this._renderPreviewStep();
      buttons = [
        { text: 'Cancel', className: 'btn-secondary', onClick: () => this.close() },
        { 
          text: `Confirm Import (${this.state.stats.valid} Valid Records)`, 
          className: 'btn-primary', 
          onClick: () => this.confirmImport(),
          disabled: this.state.stats.valid === 0
        }
      ];
    } else if (this.state.step === 3) {
      content = this._renderSuccessStep();
      buttons = [
        { text: 'Done', className: 'btn-primary', onClick: () => {
          this.close();
          App.renderCurrentView(); // Refresh the underlying list
        }}
      ];
    }

    UIService.openModal(title, content, buttons);
    
    // Attach event listeners after rendering
    if (this.state.step === 1) {
      const dropZone = document.getElementById('excel-drop-zone');
      const fileInput = document.getElementById('excel-file-input');
      
      if (dropZone && fileInput) {
        dropZone.addEventListener('dragover', (e) => {
          e.preventDefault();
          dropZone.style.borderColor = 'var(--color-primary)';
          dropZone.style.background = '#EFF6FF';
        });
        dropZone.addEventListener('dragleave', (e) => {
          e.preventDefault();
          dropZone.style.borderColor = '#CBD5E1';
          dropZone.style.background = '#F8FAFC';
        });
        dropZone.addEventListener('drop', (e) => {
          e.preventDefault();
          dropZone.style.borderColor = '#CBD5E1';
          dropZone.style.background = '#F8FAFC';
          if (e.dataTransfer.files.length) {
            this.handleFileSelect(e.dataTransfer.files[0]);
          }
        });
        fileInput.addEventListener('change', (e) => {
          if (e.target.files.length) {
            this.handleFileSelect(e.target.files[0]);
          }
        });
      }
    }
  },

  _renderUploadStep() {
    return `
      <div style="text-align:center; padding:1rem;">
        <p style="margin-bottom:1.5rem; color:var(--color-text-muted);">
          Upload your Excel file to bulk import ${this.state.type === 'STUDENT' ? 'students' : 'faculty'}. Only <strong>.xlsx</strong> files are supported.
        </p>

        <div id="excel-drop-zone" style="
          border: 2px dashed #CBD5E1; 
          border-radius: 8px; 
          padding: 3rem 2rem; 
          background: #F8FAFC; 
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 1.5rem;
        " onclick="document.getElementById('excel-file-input').click()">
          <i data-lucide="upload-cloud" style="width:48px; height:48px; color:var(--color-primary); margin-bottom:1rem;"></i>
          <h3 style="margin:0 0 0.5rem 0; font-size:1.1rem; color:var(--color-navy-dark);">Drag & Drop Excel File Here</h3>
          <p style="margin:0; font-size:0.9rem; color:var(--color-text-muted);">or click to browse from your computer</p>
          <input type="file" id="excel-file-input" accept=".xlsx" style="display:none;">
        </div>

        ${this.state.file ? `
          <div style="background:#EFF6FF; border:1px solid #BFDBFE; padding:1rem; border-radius:6px; display:inline-block; margin-bottom:1.5rem;">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <i data-lucide="file-spreadsheet" style="color:#2563EB;"></i>
              <span style="font-weight:600; color:#1E40AF;">${this.state.file.name}</span>
            </div>
          </div>
        ` : ''}

        <div>
          <button class="btn-secondary" onclick="ExcelImportService.${this.state.type === 'STUDENT' ? 'downloadStudentTemplate()' : 'downloadFacultyTemplate()'}">
            <i data-lucide="download"></i> Download ${this.state.type === 'STUDENT' ? 'Student' : 'Faculty'} Template
          </button>
        </div>
      </div>
    `;
  },

  _renderPreviewStep() {
    let filteredRecords = this.state.records;
    if (this.state.filterStatus !== 'ALL') {
      filteredRecords = filteredRecords.filter(r => r.__importStatus === this.state.filterStatus);
    }
    
    if (this.state.searchQuery) {
      const q = this.state.searchQuery.toLowerCase();
      filteredRecords = filteredRecords.filter(r => 
        (r['Name'] || '').toLowerCase().includes(q) ||
        (r['Roll No'] || '').toLowerCase().includes(q) ||
        (r['Registration No'] || '').toLowerCase().includes(q) ||
        (r['Email'] || '').toLowerCase().includes(q)
      );
    }

    return `
      <div style="margin-bottom:1rem; display:flex; flex-wrap:wrap; gap:1rem; align-items:center; justify-content:space-between;">
        <div style="display:flex; gap:1rem;">
          <div style="background:#F1F5F9; padding:0.5rem 1rem; border-radius:6px; text-align:center;">
            <div style="font-size:1.25rem; font-weight:800;">${this.state.stats.total}</div>
            <div style="font-size:0.75rem; font-weight:600; color:#64748B; text-transform:uppercase;">Total Records</div>
          </div>
          <div style="background:#DCFCE7; padding:0.5rem 1rem; border-radius:6px; text-align:center;">
            <div style="font-size:1.25rem; font-weight:800; color:#166534;">${this.state.stats.valid}</div>
            <div style="font-size:0.75rem; font-weight:600; color:#166534; text-transform:uppercase;">Valid</div>
          </div>
          <div style="background:#FEF9C3; padding:0.5rem 1rem; border-radius:6px; text-align:center;">
            <div style="font-size:1.25rem; font-weight:800; color:#854D0E;">${this.state.stats.duplicate}</div>
            <div style="font-size:0.75rem; font-weight:600; color:#854D0E; text-transform:uppercase;">Duplicates</div>
          </div>
          <div style="background:#FEE2E2; padding:0.5rem 1rem; border-radius:6px; text-align:center;">
            <div style="font-size:1.25rem; font-weight:800; color:#991B1B;">${this.state.stats.invalid}</div>
            <div style="font-size:0.75rem; font-weight:600; color:#991B1B; text-transform:uppercase;">Invalid</div>
          </div>
        </div>
        
        <div>
           <button class="btn-secondary" onclick="BulkImportModal.downloadErrors()" ${this.state.stats.invalid === 0 && this.state.stats.duplicate === 0 ? 'disabled' : ''}>
             <i data-lucide="download-cloud"></i> Download Error Report
           </button>
        </div>
      </div>

      <div style="background:#FFFBEB; border:1px solid #FEF3C7; color:#92400E; padding:0.75rem; border-radius:6px; margin-bottom:1rem; font-size:0.85rem;">
        <strong>Notice:</strong> Only <strong>VALID</strong> records will be imported. Duplicates and Invalid records will be safely skipped.
      </div>

      <div style="display:flex; gap:0.5rem; margin-bottom:1rem; align-items:center;">
        <input type="text" class="form-input" placeholder="Search preview..." style="width:200px; padding:0.4rem 0.75rem; font-size:0.85rem;" onkeyup="BulkImportModal.setSearch(this.value)">
        <select class="form-select" style="padding:0.4rem 0.75rem; font-size:0.85rem;" onchange="BulkImportModal.setFilter(this.value)">
          <option value="ALL" ${this.state.filterStatus === 'ALL' ? 'selected' : ''}>All Records</option>
          <option value="VALID" ${this.state.filterStatus === 'VALID' ? 'selected' : ''}>Valid Only</option>
          <option value="INVALID" ${this.state.filterStatus === 'INVALID' ? 'selected' : ''}>Invalid Only</option>
          <option value="DUPLICATE" ${this.state.filterStatus === 'DUPLICATE' ? 'selected' : ''}>Duplicates Only</option>
        </select>
      </div>

      <div class="table-responsive" style="max-height: 400px; overflow-y: auto; border:1px solid var(--color-border); border-radius:8px;">
        <table class="data-table" style="margin:0; font-size:0.85rem;">
          <thead style="position: sticky; top: 0; background: #F8FAFC; z-index: 1;">
            <tr>
              <th style="width:60px;">Row</th>
              <th>Name</th>
              ${this.state.type === 'STUDENT' ? '<th>Roll No</th>' : '<th>Emp ID</th>'}
              <th>Department</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            ${filteredRecords.length === 0 ? `
              <tr><td colspan="6" style="text-align:center; padding:2rem; color:#94A3B8;">No records match your filter.</td></tr>
            ` : filteredRecords.map(r => {
              
              let statusBadge = '';
              if (r.__importStatus === 'VALID') statusBadge = '<span style="background:#DCFCE7; color:#166534; padding:2px 6px; border-radius:4px; font-weight:700; font-size:0.75rem;">VALID</span>';
              if (r.__importStatus === 'INVALID') statusBadge = '<span style="background:#FEE2E2; color:#991B1B; padding:2px 6px; border-radius:4px; font-weight:700; font-size:0.75rem;">INVALID</span>';
              if (r.__importStatus === 'DUPLICATE') statusBadge = '<span style="background:#FEF9C3; color:#854D0E; padding:2px 6px; border-radius:4px; font-weight:700; font-size:0.75rem;">DUPLICATE</span>';

              return `
                <tr style="${r.__importStatus !== 'VALID' ? 'background:#FAFAFA;' : ''}">
                  <td style="color:#64748B;">${r.__originalRowIndex}</td>
                  <td style="font-weight:600;">${r['Name']}</td>
                  <td><code>${this.state.type === 'STUDENT' ? (r['Roll No'] || '') : (r['Employee ID'] || '')}</code></td>
                  <td>${r['Department'] || ''}</td>
                  <td>${statusBadge}</td>
                  <td style="color:#991B1B; font-size:0.75rem;">${r.__importError || ''}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  _renderSuccessStep() {
    return `
      <div style="text-align:center; padding:2rem;">
        <div style="display:inline-flex; align-items:center; justify-content:center; width:64px; height:64px; background:#DCFCE7; color:#166534; border-radius:50%; margin-bottom:1.5rem;">
          <i data-lucide="check-circle" style="width:32px; height:32px;"></i>
        </div>
        <h2 style="margin:0 0 1rem 0; color:var(--color-navy-dark);">Import Completed!</h2>
        
        <div style="background:#F8FAFC; border:1px solid var(--color-border); padding:1.5rem; border-radius:8px; display:inline-block; text-align:left; min-width:300px; margin-bottom:1.5rem;">
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
            <span style="color:var(--color-text-muted);">Successfully Imported:</span>
            <strong style="color:#166534;">${this.state.stats.valid}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
            <span style="color:var(--color-text-muted);">Skipped Duplicates:</span>
            <strong style="color:#854D0E;">${this.state.stats.duplicate}</strong>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--color-text-muted);">Failed / Invalid:</span>
            <strong style="color:#991B1B;">${this.state.stats.invalid}</strong>
          </div>
        </div>

        <div>
          ${(this.state.stats.invalid > 0 || this.state.stats.duplicate > 0) ? `
            <button class="btn-secondary" onclick="BulkImportModal.downloadErrors()">
              <i data-lucide="download"></i> Download Error Report
            </button>
          ` : ''}
        </div>
      </div>
    `;
  },

  handleFileSelect(file) {
    if (!file.name.endsWith('.xlsx')) {
      UIService.showToast("Invalid file type. Only .xlsx is supported.", "danger");
      return;
    }
    this.state.file = file;
    // Force re-render to enable Validate button
    this.render();
  },

  setFilter(status) {
    this.state.filterStatus = status;
    this.render();
  },

  setSearch(query) {
    this.state.searchQuery = query;
    this.render();
  },

  downloadErrors() {
    ExcelImportService.downloadErrorReport(this.state.records, this.state.type === 'STUDENT' ? 'Students' : 'Faculty');
  },

  async processFile() {
    const file = this.state.file;
    if (!file) return;

    // Show loading state by modifying modal content directly without changing step yet
    const modalBody = document.querySelector('.modal-body');
    if (modalBody) {
      modalBody.innerHTML = `
        <div style="padding: 3rem; text-align: center; color: var(--color-text-muted);">
           <i data-lucide="loader" class="spin" style="width:32px; height:32px; margin-bottom:1rem; display:inline-block; animation: spin 2s linear infinite;"></i>
           <p style="font-size:1.1rem; font-weight:600;">Validating Excel Data...</p>
        </div>
      `;
      lucide.createIcons();
    }

    try {
      const rawJson = await ExcelImportService.parseExcel(file);
      
      let validatedRecords = [];
      if (this.state.type === 'STUDENT') {
        validatedRecords = BulkImportValidationService.validateStudents(rawJson);
      } else {
        validatedRecords = BulkImportValidationService.validateFaculty(rawJson);
      }

      this.state.records = validatedRecords;
      
      // Calculate Stats
      this.state.stats.total = validatedRecords.length;
      this.state.stats.valid = validatedRecords.filter(r => r.__importStatus === 'VALID').length;
      this.state.stats.invalid = validatedRecords.filter(r => r.__importStatus === 'INVALID').length;
      this.state.stats.duplicate = validatedRecords.filter(r => r.__importStatus === 'DUPLICATE').length;

      this.state.step = 2; // Move to Preview
      this.render();
    } catch (err) {
      UIService.showToast(err.message, "danger");
      this.render(); // reset to step 1
    }
  },

  confirmImport() {
    const validRecords = this.state.records.filter(r => r.__importStatus === 'VALID');
    if (validRecords.length === 0) return;

    try {
      if (this.state.type === 'STUDENT') {
        studentService.bulkImportStudents(validRecords);
      } else {
        facultyService.bulkImportFaculty(validRecords);
      }
      
      UIService.showToast(`Successfully imported ${validRecords.length} records!`, "success");
      this.state.step = 3; // Move to Success
      this.render();
    } catch (err) {
      UIService.showToast("Failed during import insertion: " + err.message, "danger");
    }
  }
};

window.BulkImportModal = BulkImportModal;


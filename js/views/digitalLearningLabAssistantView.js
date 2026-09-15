/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - LAB ASSISTANT DIGITAL LEARNING VIEW
   ========================================================================== */

const DigitalLearningLabAssistantView = {
  searchQuery: '',
  activeCategory: 'ALL',
  loading: true,
  error: null,
  allResources: [],
  myResources: [],
  subjects: [], // Required for subjectId mapping (using existing subject list)
  initialized: false,
  _isFetching: false,

  categories: [
    { value: 'LAB MANUAL', label: 'Lab Manual' },
    { value: 'PRACTICAL GUIDE', label: 'Practical Guide' },
    { value: 'EXPERIMENT PROCEDURE', label: 'Experiment Procedure' },
    { value: 'EQUIPMENT MANUAL', label: 'Equipment Manual' },
    { value: 'EQUIPMENT USAGE GUIDE', label: 'Equipment Usage Guide' },
    { value: 'PROGRAMMING LAB MATERIAL', label: 'Programming Lab Material' },
    { value: 'LAB SYLLABUS', label: 'Lab Syllabus' },
    { value: 'LAB INSTRUCTIONS', label: 'Lab Instructions' },
    { value: 'SAFETY GUIDELINES', label: 'Safety Guidelines' },
    { value: 'REFERENCE MATERIAL', label: 'Reference Material' },
    { value: 'LAB VIDEO / TUTORIAL', label: 'Lab Video / Tutorial' },
    { value: 'LAB NOTICE', label: 'Lab Notice' },
    { value: 'IMPORTANT LAB DOCUMENT', label: 'Important Lab Document' },
    { value: 'USEFUL LAB RESOURCE', label: 'Useful Lab Resource' },
    { value: 'OTHER LAB MATERIAL', label: 'Other Lab Material' }
  ],

  render() {
    const user = authService.getCurrentUser();
    if (!user || user.role !== 'LAB_ASSISTANT') return `<div>Access Denied</div>`;

    if (!this.initialized) {
      return `
        <div style="padding: 4rem 2rem; text-align: center;">
          <div class="spinner" style="border:4px solid #F1F5F9; border-top:4px solid var(--color-primary); border-radius:50%; width:40px; height:40px; animation:spin 1s linear infinite; margin: 0 auto;"></div>
          <p style="margin-top: 1.5rem; color: var(--color-text-muted); font-weight: 600;">Loading Lab Digital Learning...</p>
        </div>
      `;
    }

    if (this.error) {
      return `
        <div style="padding: 4rem 2rem; text-align: center; color: var(--color-danger);">
          <i data-lucide="alert-circle" style="width: 48px; height: 48px; margin-bottom: 1rem; color: var(--color-danger);"></i>
          <p style="font-weight: 600;">${this.error}</p>
          <button class="btn-primary" style="margin-top: 1rem;" onclick="DigitalLearningLabAssistantView.fetchData()">Try Again</button>
        </div>
      `;
    }

    const totalMaterials = this.myResources.length;
    const labManuals = this.myResources.filter(r => r.resourceType === 'LAB MANUAL').length;
    const practicalGuides = this.myResources.filter(r => r.resourceType === 'PRACTICAL GUIDE').length;
    const equipmentGuides = this.myResources.filter(r => r.resourceType === 'EQUIPMENT USAGE GUIDE' || r.resourceType === 'EQUIPMENT MANUAL').length;
    
    // Sort by uploadedAt descending
    const recentUploads = [...this.myResources].sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0)).slice(0, 5).length;

    // Filter resources
    let filteredList = this.myResources;
    if (this.activeCategory !== 'ALL') {
      filteredList = filteredList.filter(r => r.resourceType === this.activeCategory);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filteredList = filteredList.filter(r => 
        r.title.toLowerCase().includes(q) || 
        r.resourceType.toLowerCase().includes(q) || 
        (r.laboratoryName && r.laboratoryName.toLowerCase().includes(q))
      );
    }

    return `
      <div class="page-header" style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--color-navy-dark); margin-bottom: 0.25rem;">POORNIMA GROUP OF COLLEGE - Lab Digital Learning</h1>
          <p style="color: var(--color-text-muted); font-size: 1rem;">Upload and manage laboratory study material, practical guides and lab resources.</p>
        </div>
        <div>
          <button class="btn-primary" onclick="DigitalLearningLabAssistantView.openUploadModal()" style="display: flex; align-items: center; gap: 0.5rem; background: var(--poornima-blue);">
            <i data-lucide="upload" style="width: 18px; height: 18px;"></i>
            Upload Lab Material
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        <div class="stat-card" style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 1.25rem; border: 1px solid var(--color-border-light);">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(14, 165, 233, 0.1); color: #0EA5E9; display: flex; align-items: center; justify-content: center;">
            <i data-lucide="book-open" style="width: 24px; height: 24px;"></i>
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-navy-dark);">${totalMaterials}</div>
            <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Total Materials</div>
          </div>
        </div>
        
        <div class="stat-card" style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 1.25rem; border: 1px solid var(--color-border-light);">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(16, 185, 129, 0.1); color: #10B981; display: flex; align-items: center; justify-content: center;">
            <i data-lucide="file-text" style="width: 24px; height: 24px;"></i>
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-navy-dark);">${labManuals}</div>
            <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Lab Manuals</div>
          </div>
        </div>
        
        <div class="stat-card" style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 1.25rem; border: 1px solid var(--color-border-light);">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(245, 158, 11, 0.1); color: #F59E0B; display: flex; align-items: center; justify-content: center;">
            <i data-lucide="clipboard-list" style="width: 24px; height: 24px;"></i>
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-navy-dark);">${practicalGuides}</div>
            <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Practical Guides</div>
          </div>
        </div>

        <div class="stat-card" style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 1.25rem; border: 1px solid var(--color-border-light);">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(139, 92, 246, 0.1); color: #8B5CF6; display: flex; align-items: center; justify-content: center;">
            <i data-lucide="monitor" style="width: 24px; height: 24px;"></i>
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-navy-dark);">${equipmentGuides}</div>
            <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Equipment Guides</div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center;">
          <div class="search-box" style="flex: 1; min-width: 240px; position: relative;">
            <i data-lucide="search" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--color-text-light); width: 18px; height: 18px;"></i>
            <input type="text" class="form-control" style="padding-left: 2.75rem;" placeholder="Search materials..." value="${this.searchQuery}" onkeyup="DigitalLearningLabAssistantView.handleSearch(this.value)">
          </div>
          <select class="form-control" style="width: auto; min-width: 200px;" onchange="DigitalLearningLabAssistantView.filterCategory(this.value)">
            <option value="ALL">All Categories</option>
            ${this.categories.map(c => `<option value="${c.value}" ${this.activeCategory === c.value ? 'selected' : ''}>${c.label}</option>`).join('')}
          </select>
          <button class="btn-secondary" onclick="DigitalLearningLabAssistantView.filterCategory('ALL'); document.querySelector('.search-box input').value=''; DigitalLearningLabAssistantView.handleSearch('');" style="display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="x" style="width: 16px; height: 16px;"></i> Clear Filters
          </button>
        </div>
      </div>

      <!-- Materials Table -->
      <div class="card" style="padding: 0; overflow: hidden;">
        ${filteredList.length === 0 ? `
          <div style="padding: 4rem 2rem; text-align: center; color: var(--color-text-muted);">
            <div style="width: 64px; height: 64px; border-radius: 50%; background: #F1F5F9; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem auto; color: #94A3B8;">
              <i data-lucide="folder-open" style="width: 32px; height: 32px;"></i>
            </div>
            <p style="font-size: 1.1rem; font-weight: 600; color: var(--color-navy-dark); margin: 0 0 0.5rem 0;">No Lab Materials Found</p>
            <p style="margin: 0; font-size: 0.95rem;">You haven't uploaded any materials matching your criteria yet.</p>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="data-table" style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #F8FAFC; border-bottom: 2px solid #E2E8F0;">
                  <th style="padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Material</th>
                  <th style="padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Category & Lab</th>
                  <th style="padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Semester</th>
                  <th style="padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Upload Date</th>
                  <th style="padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Status</th>
                  <th style="padding: 1rem; text-align: right; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filteredList.map(res => `
                  <tr style="border-bottom: 1px solid var(--color-border-light); transition: background 0.2s;" onmouseover="this.style.background='#F8FAFC'" onmouseout="this.style.background='transparent'">
                    <td style="padding: 1rem;">
                      <div style="font-size: 0.95rem; font-weight: 700; color: var(--color-navy-dark); margin-bottom: 0.25rem;">${res.title}</div>
                      <div style="font-size: 0.75rem; color: var(--color-text-light); max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${res.description || 'No description'}</div>
                    </td>
                    <td style="padding: 1rem;">
                      <span style="display: inline-block; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; background: #EEF2FF; color: #4F46E5; border: 1px solid #C7D2FE; margin-bottom: 0.25rem;">
                        ${res.resourceType}
                      </span>
                      <div style="font-size: 0.8rem; font-weight: 600; color: var(--color-text-muted);">${res.laboratoryName || 'N/A'} (${res.department || '-'})</div>
                    </td>
                    <td style="padding: 1rem; font-size: 0.85rem; font-weight: 600; color: var(--color-text-regular);">Sem ${res.semester || '-'}</td>
                    <td style="padding: 1rem; font-size: 0.85rem; color: var(--color-text-muted);">${new Date(res.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td style="padding: 1rem;">
                      <span style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; ${res.status === 'ACTIVE' ? 'background: #DCFCE7; color: #16A34A; border: 1px solid #BBF7D0;' : 'background: #F1F5F9; color: #64748B; border: 1px solid #E2E8F0;'}">
                        ${res.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td style="padding: 1rem; text-align: right;">
                      <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                        <button class="btn-secondary btn-sm" onclick="DigitalLearningLabAssistantView.openEditModal('${res.id}')" style="padding: 0.4rem 0.6rem;" title="Edit">
                          <i data-lucide="edit-2" style="width: 14px; height: 14px;"></i>
                        </button>
                        <button class="btn-secondary btn-sm" onclick="DigitalLearningLabAssistantView.deleteResource('${res.id}')" style="padding: 0.4rem 0.6rem; color: #EF4444; border-color: #FECACA; background: #FEF2F2;" title="Delete">
                          <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  },

  handleSearch(val) {
    this.searchQuery = val;
    App.renderCurrentView();
  },

  filterCategory(val) {
    this.activeCategory = val;
    App.renderCurrentView();
  },

  openUploadModal() {
    // Requires subjects to populate Subject/Lab dropdown if any
    const modalHtml = `
      <form id="lab-upload-form" onsubmit="event.preventDefault();">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Material Title <span style="color:red;">*</span></label>
            <input type="text" id="ul-title" class="form-control" required placeholder="e.g. C++ Lab Manual V2">
          </div>
          <div class="form-group">
            <label class="form-label">Category <span style="color:red;">*</span></label>
            <select id="ul-category" class="form-control" required>
              ${this.categories.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Laboratory Room <span style="color:red;">*</span></label>
            <input type="text" id="ul-lab" class="form-control" required placeholder="e.g. CS Lab 3">
          </div>
          <div class="form-group">
            <label class="form-label">Department</label>
            <select id="ul-dept" class="form-control">
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="ME">ME</option>
              <option value="EE">EE</option>
              <option value="CE">CE</option>
              <option value="IT">IT</option>
              <option value="AI&DS">AI & DS</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Semester</label>
            <select id="ul-sem" class="form-control">
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
              <option value="7">Semester 7</option>
              <option value="8">Semester 8</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Mapped Subject/Lab <span style="color:red;">*</span></label>
            <select id="ul-subject" class="form-control" required>
              ${this.subjects.length > 0 ? this.subjects.map(s => `<option value="${s.id}">${s.name} (${s.code})</option>`).join('') : '<option value="GENERIC_LAB">General Lab Requirement</option>'}
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label">Description</label>
          <textarea id="ul-desc" class="form-control" rows="3" placeholder="Additional details, instructions, or prerequisites..."></textarea>
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label">Upload File / Resource Link <span style="color:red;">*</span></label>
          <input type="file" id="ul-file" class="form-control" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.png,.jpg,.zip">
          <small style="color:var(--color-text-muted); font-size:0.75rem;">Max size: 25MB (Using existing mock upload handling for files)</small>
        </div>
      </form>
    `;

    UIService.openModal(
      "UPLOAD LAB MATERIAL",
      modalHtml,
      [
        { text: 'Cancel', className: 'btn-secondary', onClick: () => UIService.closeModal() },
        { 
          text: 'Upload Material', 
          className: 'btn-primary', 
          onClick: async () => {
            const title = document.getElementById('ul-title').value;
            const category = document.getElementById('ul-category').value;
            const lab = document.getElementById('ul-lab').value;
            const dept = document.getElementById('ul-dept').value;
            const sem = document.getElementById('ul-sem').value;
            const subjectId = document.getElementById('ul-subject').value;
            const desc = document.getElementById('ul-desc').value;
            const fileInput = document.getElementById('ul-file');
            
            if (!title || !category || !lab || !subjectId) {
              UIService.showToast("Please fill all required fields.", "error");
              return;
            }

            const fileName = fileInput.files && fileInput.files[0] ? fileInput.files[0].name : `${title.replace(/\s+/g, '_')}.pdf`;
            const user = authService.getCurrentUser();

            try {
              const newResource = await LearningResourceService.createResource({
                title: title,
                subjectId: subjectId,
                facultyId: user.uid || user.id, // Stored as facultyId but actually Lab Assistant UID
                resourceType: category,
                description: desc,
                fileName: fileName,
                semester: sem,
                department: dept,
                laboratoryName: lab
              });

              if (newResource) {
                // Trigger notification reusing existing service
                if (typeof notificationService !== 'undefined') {
                  notificationService.createNotification(
                    'SYSTEM_WIDE',
                    'New Lab Material Available',
                    `New ${category} for ${lab} has been uploaded: ${title}.`,
                    'MEDIUM',
                    'digital-learning'
                  );
                }

                UIService.showToast("Lab material uploaded successfully!", "success");
                UIService.closeModal();
                this.loading = true; 
                this.fetchData();
              }
            } catch (err) {
              UIService.showToast(err.message || "Failed to upload material", "error");
            }
          } 
        }
      ]
    );
  },

  openEditModal(id) {
    const res = this.myResources.find(r => r.id === id);
    if (!res) return;

    const modalHtml = `
      <form id="lab-edit-form" onsubmit="event.preventDefault();">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Material Title <span style="color:red;">*</span></label>
            <input type="text" id="edit-ul-title" class="form-control" required value="${res.title}">
          </div>
          <div class="form-group">
            <label class="form-label">Category <span style="color:red;">*</span></label>
            <select id="edit-ul-category" class="form-control" required>
              ${this.categories.map(c => `<option value="${c.value}" ${res.resourceType === c.value ? 'selected' : ''}>${c.label}</option>`).join('')}
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Laboratory Room <span style="color:red;">*</span></label>
            <input type="text" id="edit-ul-lab" class="form-control" required value="${res.laboratoryName || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Department</label>
            <select id="edit-ul-dept" class="form-control">
              ${['CSE', 'ECE', 'ME', 'EE', 'CE', 'IT', 'AI&DS'].map(d => `<option value="${d}" ${res.department === d ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label">Status</label>
          <select id="edit-ul-status" class="form-control">
            <option value="ACTIVE" ${res.status === 'ACTIVE' ? 'selected' : ''}>Active</option>
            <option value="INACTIVE" ${res.status === 'INACTIVE' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label">Description</label>
          <textarea id="edit-ul-desc" class="form-control" rows="3">${res.description || ''}</textarea>
        </div>
      </form>
    `;

    UIService.openModal(
      "EDIT LAB MATERIAL",
      modalHtml,
      [
        { text: 'Cancel', className: 'btn-secondary', onClick: () => UIService.closeModal() },
        { 
          text: 'Save Changes', 
          className: 'btn-primary', 
          onClick: async () => {
            const title = document.getElementById('edit-ul-title').value;
            const category = document.getElementById('edit-ul-category').value;
            const lab = document.getElementById('edit-ul-lab').value;
            const dept = document.getElementById('edit-ul-dept').value;
            const desc = document.getElementById('edit-ul-desc').value;
            const status = document.getElementById('edit-ul-status').value;
            
            if (!title || !category || !lab) {
              UIService.showToast("Please fill all required fields.", "error");
              return;
            }

            try {
              await LearningResourceService.updateResource(id, {
                title: title,
                resourceType: category,
                description: desc,
                laboratoryName: lab,
                department: dept,
                status: status
              });

              UIService.showToast("Lab material updated successfully!", "success");
              UIService.closeModal();
              this.loading = true; 
              this.fetchData();
            } catch (err) {
              UIService.showToast(err.message || "Failed to update material", "error");
            }
          } 
        }
      ]
    );
  },

  deleteResource(id) {
    UIService.showConfirm("Delete Lab Material", "Are you sure you want to delete this material? This action cannot be undone.", async () => {
      try {
        await LearningResourceService.deleteResource(id);
        UIService.showToast("Lab material deleted successfully.", "success");
        this.loading = true;
        this.fetchData();
      } catch (err) {
        UIService.showToast("Failed to delete material.", "error");
      }
    });
  },

  async fetchData() {
    if (this._isFetching) return;
    this._isFetching = true;
    this.loading = true;
    this.error = null;

    if (this.initialized) App.renderCurrentView();

    try {
      const user = authService.getCurrentUser();
      
      // Load global subjects to populate dropdowns
      if (typeof subjectService !== 'undefined') {
        this.subjects = subjectService.getSubjectsFromFirestore ? await subjectService.getSubjectsFromFirestore() : (subjectService.getSubjects ? subjectService.getSubjects() : []);
      }

      // We use the existing learningResources collection
      // Find resources uploaded by this specific Lab Assistant
      if (window.FirebaseService && window.FirebaseService.db) {
        const snap = await window.FirebaseService.db.collection('learningResources')
          .where('facultyId', '==', user.uid || user.id)
          .get();
        this.myResources = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } else {
        // Fallback or memory-based
        const allRes = await LearningResourceService.getAllResources();
        this.myResources = allRes.filter(r => r.facultyId === (user.uid || user.id));
      }

      this.loading = false;
      this.initialized = true;
      this._isFetching = false;
      App.renderCurrentView();

      if (window.lucide) window.lucide.createIcons();
    } catch (e) {
      console.error("DigitalLearningLabAssistantView fetchData Error:", e);
      this.error = "Unable to load lab learning resources. Please check your connection and try again.";
      this.loading = false;
      this.initialized = true;
      this._isFetching = false;
      App.renderCurrentView();
    }
  },

  afterRender() {
    if (!this.initialized && !this._isFetching && !this.error) {
      this.fetchData();
    }
    if (window.lucide) window.lucide.createIcons();
  }
};

window.DigitalLearningLabAssistantView = DigitalLearningLabAssistantView;

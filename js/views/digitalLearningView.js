/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - DIGITAL LEARNING VIEW CONTROLLER
   ========================================================================== */

const DigitalLearningView = {
  activeSubjectId: null,
  activeFilterType: 'ALL',
  searchQuery: '',

  render(params = {}) {
    const user = authService.getCurrentUser();
    if (!user) return `<div>Please log in.</div>`;

    if (params.subjectId) {
      this.activeSubjectId = params.subjectId;
    }

    if (user.role === 'STUDENT') {
      return this.renderStudentView(user);
    } else if (AuthorizationService.isAcademicStaff(user)) {
      return this.renderFacultyView(user);
    } else {
      return this.renderAdminView(user);
    }
  },

  // --------------------------------------------------------------------------
  // STUDENT VIEW
  // --------------------------------------------------------------------------
  renderStudentView(user) {
    const student = DataStore.get('STUDENTS').find(s => s.email === user.email || s.userId === user.uid) || DataStore.get('STUDENTS')[0];
    const subjects = subjectService.getSubjects();
    const allResources = LearningResourceService.getAllResources().filter(r => r.status === 'ACTIVE');

    // If a specific subject is selected, show Subject Resource detail page
    if (this.activeSubjectId) {
      const selectedSubject = subjects.find(s => s.id === this.activeSubjectId) || subjects[0];
      const subjectResources = allResources.filter(r => r.subjectId === selectedSubject.id);

      // Group by category
      const categories = [
        { type: 'NOTES', title: 'NOTES', icon: 'file-text' },
        { type: 'BOOK', title: 'BOOK SUGGESTIONS', icon: 'book' },
        { type: 'ASSIGNMENT', title: 'ASSIGNMENTS', icon: 'clipboard-list' },
        { type: 'TUTE', title: 'TUTES', icon: 'help-circle' },
        { type: 'OTHER', title: 'OTHER MATERIALS', icon: 'folder' }
      ];

      return `
        <div class="page-header" style="display:flex; align-items:center; justify-content:space-between;">
          <div>
            <button class="btn-secondary" onclick="DigitalLearningView.clearSubject()" style="margin-bottom:0.5rem; padding:0.35rem 0.75rem; font-size:0.85rem;">
              <i data-lucide="arrow-left"></i> Back to Subjects
            </button>
            <h1 style="margin:0;">${selectedSubject.name} (${selectedSubject.code})</h1>
            <p style="margin:0.25rem 0 0 0; font-size:0.9rem; color:var(--color-text-muted);">
              Department: ${selectedSubject.department || 'CSE'} | Credits: ${selectedSubject.credits || 4}
            </p>
          </div>
          <div>
            <span class="status-badge active">${subjectResources.length} Resources</span>
          </div>
        </div>

        <!-- SEARCH AND FILTER BAR -->
        <div class="card" style="margin-bottom:1.5rem;">
          <div style="display:flex; flex-wrap:wrap; gap:1rem; align-items:center;">
            <div class="search-box" style="flex:1; min-width:240px;">
              <i data-lucide="search"></i>
              <input type="text" class="search-input" id="resource-search" placeholder="Search notes, assignments, books..." value="${this.searchQuery}" onkeyup="DigitalLearningView.handleSearch(this.value)">
            </div>
            <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
              <button class="btn-secondary ${this.activeFilterType === 'ALL' ? 'active-filter' : ''}" onclick="DigitalLearningView.filterCategory('ALL')">All</button>
              <button class="btn-secondary ${this.activeFilterType === 'NOTES' ? 'active-filter' : ''}" onclick="DigitalLearningView.filterCategory('NOTES')">Notes</button>
              <button class="btn-secondary ${this.activeFilterType === 'ASSIGNMENT' ? 'active-filter' : ''}" onclick="DigitalLearningView.filterCategory('ASSIGNMENT')">Assignments</button>
              <button class="btn-secondary ${this.activeFilterType === 'TUTE' ? 'active-filter' : ''}" onclick="DigitalLearningView.filterCategory('TUTE')">Tutes</button>
              <button class="btn-secondary ${this.activeFilterType === 'BOOK' ? 'active-filter' : ''}" onclick="DigitalLearningView.filterCategory('BOOK')">Books</button>
            </div>
          </div>
        </div>

        <!-- CATEGORY SECTIONS -->
        <div class="resource-categories-container">
          ${categories.map(cat => {
            if (this.activeFilterType !== 'ALL' && this.activeFilterType !== cat.type) return '';
            
            let catResources = subjectResources.filter(r => r.resourceType === cat.type);
            if (this.searchQuery) {
              const q = this.searchQuery.toLowerCase();
              catResources = catResources.filter(r => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
            }

            return `
              <div class="card" style="margin-bottom:1.5rem;">
                <div class="card-header" style="border-bottom:1px solid #F1F5F9; padding-bottom:0.75rem;">
                  <h3 class="card-title"><i data-lucide="${cat.icon}"></i> ${cat.title} (${catResources.length})</h3>
                </div>

                ${catResources.length === 0 ? `
                  <div style="padding:1.5rem; text-align:center; color:var(--color-text-muted); font-size:0.9rem;">
                    No ${cat.title.toLowerCase()} available for this subject.
                  </div>
                ` : `
                  <div class="resource-list" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:1rem; margin-top:1rem;">
                    ${catResources.map(r => this.renderResourceCard(r)).join('')}
                  </div>
                `}
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // Default Overview Mode: Subject Cards
    return `
      <div class="page-header">
        <h1>DIGITAL LEARNING PORTAL</h1>
        <p>Access study notes, assignments, tutorial sheets, and book suggestions uploaded by faculty.</p>
      </div>

      <!-- SEARCH & FILTER BAR -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div style="display:flex; flex-wrap:wrap; gap:1rem; align-items:center; justify-content:space-between;">
          <div class="search-box" style="flex:1; min-width:260px;">
            <i data-lucide="search"></i>
            <input type="text" class="search-input" placeholder="Search subject or material..." onkeyup="DigitalLearningView.handleGlobalSubjectSearch(this.value)">
          </div>
          <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
            <select class="form-control" style="width:auto;" onchange="DigitalLearningView.filterSemester(this.value)">
              <option value="ALL">All Semesters</option>
              <option value="1">Semester 1</option>
              <option value="2" selected>Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="5">Semester 5</option>
            </select>
          </div>
        </div>
      </div>

      <!-- SUBJECT CARDS GRID -->
      <div class="subject-cards-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:1.25rem;">
        ${subjects.map(sub => {
          const subRes = allResources.filter(r => r.subjectId === sub.id);
          const notesCount = subRes.filter(r => r.resourceType === 'NOTES').length;
          const assignCount = subRes.filter(r => r.resourceType === 'ASSIGNMENT').length;
          const tuteCount = subRes.filter(r => r.resourceType === 'TUTE').length;
          const bookCount = subRes.filter(r => r.resourceType === 'BOOK').length;

          return `
            <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; transition:transform 0.2s ease, box-shadow 0.2s ease;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
                  <span class="status-badge active" style="font-size:0.75rem;">${sub.code}</span>
                  <span style="font-size:0.8rem; color:var(--color-text-muted);">Sem ${sub.semester}</span>
                </div>
                <h3 style="font-size:1.1rem; font-weight:700; color:var(--color-navy-dark); margin-bottom:0.75rem;">${sub.name}</h3>

                <div class="resource-counts-box" style="background:#F8FAFC; border-radius:8px; padding:0.75rem; display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem; font-size:0.85rem; margin-bottom:1rem;">
                  <div><strong style="color:#2563EB;">${notesCount}</strong> Notes</div>
                  <div><strong style="color:#D97706;">${assignCount}</strong> Assignments</div>
                  <div><strong style="color:#7C3AED;">${tuteCount}</strong> Tutes</div>
                  <div><strong style="color:#059669;">${bookCount}</strong> Books</div>
                </div>
              </div>

              <button class="btn-primary" style="width:100%; justify-content:center;" onclick="DigitalLearningView.openSubject('${sub.id}')">
                <i data-lucide="book-open"></i> Open Subject
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderResourceCard(resource) {
    return `
      <div class="resource-card" style="border:1px solid #E2E8F0; border-radius:10px; padding:1rem; background:#FFFFFF; display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <span class="status-badge ${resource.resourceType.toLowerCase()}" style="font-size:0.7rem; text-transform:uppercase;">${resource.resourceType}</span>
            <span style="font-size:0.75rem; color:var(--color-text-muted);">${resource.uploadedAt}</span>
          </div>
          <h4 style="font-size:0.95rem; font-weight:600; color:var(--color-navy-dark); margin-bottom:0.4rem;">${resource.title}</h4>
          <p style="font-size:0.825rem; color:var(--color-text-muted); line-height:1.4; margin-bottom:0.75rem;">${resource.description || 'No description provided.'}</p>
        </div>

        <div style="border-top:1px solid #F1F5F9; pt:0.5rem; padding-top:0.5rem; display:flex; gap:0.5rem;">
          <button class="btn-secondary" style="flex:1; justify-content:center; padding:0.35rem; font-size:0.8rem;" onclick="DigitalLearningView.openResourceModal('${resource.id}')">
            <i data-lucide="eye"></i> Open
          </button>
          <button class="btn-primary" style="flex:1; justify-content:center; padding:0.35rem; font-size:0.8rem;" onclick="DigitalLearningView.downloadResource('${resource.id}')">
            <i data-lucide="download"></i> Download
          </button>
        </div>
      </div>
    `;
  },

  // --------------------------------------------------------------------------
  // FACULTY VIEW
  // --------------------------------------------------------------------------
  renderFacultyView(user) {
    const faculty = DataStore.get('FACULTY').find(f => f.email === user.email || f.userId === user.uid) || DataStore.get('FACULTY')[0];
    const assignments = DataStore.get('ASSIGNMENTS').filter(a => a.facultyId === faculty.id);
    const subjects = subjectService.getSubjects();
    const myResources = LearningResourceService.getFacultyResources(faculty.id);

    return `
      <div class="page-header" style="display:flex; align-items:center; justify-content:space-between;">
        <div>
          <h1>DIGITAL LEARNING MANAGEMENT</h1>
          <p>Upload and manage academic resources for your assigned subjects.</p>
        </div>
        <button class="btn-primary" onclick="DigitalLearningView.openUploadModal()">
          <i data-lucide="upload-cloud"></i> Upload Resource
        </button>
      </div>

      <!-- MY SUBJECTS SUMMARY CARDS -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="book-open"></i> My Assigned Subjects</h3>
        </div>
        <div class="my-subjects-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap:1rem;">
          ${assignments.length === 0 ? `
            <p style="color:var(--color-text-muted);">No subjects assigned yet.</p>
          ` : assignments.map(asgn => {
            const sub = subjects.find(s => s.id === asgn.subjectId);
            const count = myResources.filter(r => r.subjectId === asgn.subjectId).length;
            return `
              <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:1rem; display:flex; align-items:center; justify-content:space-between;">
                <div>
                  <h4 style="font-size:0.95rem; font-weight:700; margin:0;">${sub ? sub.name : asgn.subjectId}</h4>
                  <span style="font-size:0.8rem; color:var(--color-text-muted);">${sub ? sub.code : ''} | ${count} Resources</span>
                </div>
                <button class="btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.75rem;" onclick="DigitalLearningView.openUploadModal('${asgn.subjectId}')">
                  + Upload
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- FACULTY RESOURCE MANAGEMENT TABLE -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="file-text"></i> My Uploaded Resources (${myResources.length})</h3>
        </div>

        ${myResources.length === 0 ? `
          <div style="padding:2rem; text-align:center; color:var(--color-text-muted);">
            No learning resources uploaded yet. Click <strong>Upload Resource</strong> above to get started.
          </div>
        ` : `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Type</th>
                  <th>File Name</th>
                  <th>Uploaded Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${myResources.map(r => {
                  const sub = subjects.find(s => s.id === r.subjectId);
                  return `
                    <tr>
                      <td><strong>${r.title}</strong></td>
                      <td>${sub ? sub.name : r.subjectId}</td>
                      <td><span class="status-badge ${r.resourceType.toLowerCase()}">${r.resourceType}</span></td>
                      <td><code>${r.fileName}</code></td>
                      <td>${r.uploadedAt}</td>
                      <td><span class="status-badge ${r.status.toLowerCase()}">${r.status}</span></td>
                      <td>
                        <button class="btn-icon" title="Edit" onclick="DigitalLearningView.openEditModal('${r.id}')"><i data-lucide="edit-2"></i></button>
                        <button class="btn-icon" style="color:var(--color-danger);" title="Delete" onclick="DigitalLearningView.deleteResource('${r.id}')"><i data-lucide="trash-2"></i></button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  },

  // --------------------------------------------------------------------------
  // ADMIN VIEW
  // --------------------------------------------------------------------------
  renderAdminView(user) {
    const resources = LearningResourceService.getAllResources();
    const subjects = subjectService.getSubjects();

    return `
      <div class="page-header" style="display:flex; align-items:center; justify-content:space-between;">
        <div>
          <h1>LEARNING RESOURCE MANAGEMENT</h1>
          <p>Global oversight of digital notes, assignments, tutorial sheets, and references across all departments.</p>
        </div>
        <button class="btn-primary" onclick="DigitalLearningView.openUploadModal()">
          <i data-lucide="plus-circle"></i> Add Resource
        </button>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="database"></i> All Digital Resources (${resources.length})</h3>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Subject</th>
                <th>Type</th>
                <th>File</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${resources.map(r => {
                const sub = subjects.find(s => s.id === r.subjectId);
                return `
                  <tr>
                    <td><strong>${r.title}</strong></td>
                    <td>${sub ? sub.name : r.subjectId}</td>
                    <td><span class="status-badge active">${r.resourceType}</span></td>
                    <td><code>${r.fileName}</code></td>
                    <td><span class="status-badge ${r.status.toLowerCase()}">${r.status}</span></td>
                    <td>
                      <button class="btn-icon" title="Edit" onclick="DigitalLearningView.openEditModal('${r.id}')"><i data-lucide="edit-2"></i></button>
                      <button class="btn-icon" style="color:var(--color-danger);" title="Delete" onclick="DigitalLearningView.deleteResource('${r.id}')"><i data-lucide="trash-2"></i></button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // Interactive Action Methods
  openSubject(subjectId) {
    this.activeSubjectId = subjectId;
    App.renderCurrentView();
  },

  clearSubject() {
    this.activeSubjectId = null;
    App.renderCurrentView();
  },

  filterCategory(type) {
    this.activeFilterType = type;
    App.renderCurrentView();
  },

  handleSearch(val) {
    this.searchQuery = val;
    App.renderCurrentView();
  },

  openResourceModal(resourceId) {
    const res = LearningResourceService.getResourceById(resourceId);
    if (!res) return;

    UIService.openModal(
      res.title,
      `
        <div style="line-height:1.6;">
          <p><strong>Resource Type:</strong> ${res.resourceType}</p>
          <p><strong>File Name:</strong> <code>${res.fileName}</code></p>
          <p><strong>Description:</strong></p>
          <div style="background:#F8FAFC; padding:0.75rem; border-radius:6px; font-size:0.9rem;">
            ${res.description || 'No additional details provided.'}
          </div>
          <p style="margin-top:1rem; font-size:0.8rem; color:var(--color-text-muted);">Uploaded on: ${res.uploadedAt}</p>
        </div>
      `,
      [
        { text: 'Close', className: 'btn-secondary', onClick: () => UIService.closeModal() },
        { text: 'Download Mock File', className: 'btn-primary', onClick: () => { UIService.closeModal(); this.downloadResource(resourceId); } }
      ]
    );
  },

  downloadResource(resourceId) {
    const res = LearningResourceService.getResourceById(resourceId);
    UIService.showToast(`Downloading mock file: ${res ? res.fileName : 'Material.pdf'}...`, 'success');
  },

  openUploadModal(presetSubjectId = '') {
    const subjects = subjectService.getSubjects();
    const modalHtml = `
      <form id="upload-resource-form">
        <div class="form-group" style="margin-bottom:1rem;">
          <label class="form-label">Resource Title <span style="color:red;">*</span></label>
          <input type="text" id="res-title" class="form-control" placeholder="e.g. Unit 1 Notes" required>
        </div>

        <div class="form-group" style="margin-bottom:1rem;">
          <label class="form-label">Subject <span style="color:red;">*</span></label>
          <select id="res-subject" class="form-control" required>
            ${subjects.map(s => `
              <option value="${s.id}" ${s.id === presetSubjectId ? 'selected' : ''}>${s.name} (${s.code})</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group" style="margin-bottom:1rem;">
          <label class="form-label">Resource Type <span style="color:red;">*</span></label>
          <select id="res-type" class="form-control" required>
            <option value="NOTES">NOTES</option>
            <option value="BOOK">BOOK SUGGESTION</option>
            <option value="ASSIGNMENT">ASSIGNMENT</option>
            <option value="TUTE">TUTE</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom:1rem;">
          <label class="form-label">Description</label>
          <textarea id="res-desc" class="form-control" rows="3" placeholder="Brief summary of topic covered..."></textarea>
        </div>

        <div class="form-group" style="margin-bottom:1rem;">
          <label class="form-label">Upload File (PDF / Doc) <span style="color:red;">*</span></label>
          <input type="file" id="res-file" class="form-control" accept=".pdf,.doc,.docx,.ppt,.pptx">
          <small style="color:var(--color-text-muted); font-size:0.75rem;">Max size: 25MB (Mock Upload handled)</small>
        </div>
      </form>
    `;

    UIService.openModal(
      "UPLOAD LEARNING RESOURCE",
      modalHtml,
      [
        { text: 'Cancel', className: 'btn-secondary', onClick: () => UIService.closeModal() },
        { 
          text: 'Upload', 
          className: 'btn-primary', 
          onClick: () => {
            const title = document.getElementById('res-title').value;
            const subjectId = document.getElementById('res-subject').value;
            const resourceType = document.getElementById('res-type').value;
            const description = document.getElementById('res-desc').value;
            const fileInput = document.getElementById('res-file');
            
            const fileName = fileInput.files && fileInput.files[0] ? fileInput.files[0].name : `${title.replace(/\s+/g, '_')}.pdf`;

            try {
              LearningResourceService.createResource({
                title, subjectId, resourceType, description, fileName
              });
              UIService.showToast("Learning resource uploaded successfully!", "success");
              UIService.closeModal();
              App.renderCurrentView();
            } catch (err) {
              UIService.showToast(err.message, "danger");
            }
          } 
        }
      ]
    );
  },

  openEditModal(resourceId) {
    const res = LearningResourceService.getResourceById(resourceId);
    if (!res) return;

    const subjects = subjectService.getSubjects();
    const modalHtml = `
      <form id="edit-resource-form">
        <div class="form-group" style="margin-bottom:1rem;">
          <label class="form-label">Resource Title</label>
          <input type="text" id="edit-res-title" class="form-control" value="${res.title}" required>
        </div>

        <div class="form-group" style="margin-bottom:1rem;">
          <label class="form-label">Subject</label>
          <select id="edit-res-subject" class="form-control">
            ${subjects.map(s => `
              <option value="${s.id}" ${s.id === res.subjectId ? 'selected' : ''}>${s.name} (${s.code})</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group" style="margin-bottom:1rem;">
          <label class="form-label">Resource Type</label>
          <select id="edit-res-type" class="form-control">
            <option value="NOTES" ${res.resourceType === 'NOTES' ? 'selected' : ''}>NOTES</option>
            <option value="BOOK" ${res.resourceType === 'BOOK' ? 'selected' : ''}>BOOK SUGGESTION</option>
            <option value="ASSIGNMENT" ${res.resourceType === 'ASSIGNMENT' ? 'selected' : ''}>ASSIGNMENT</option>
            <option value="TUTE" ${res.resourceType === 'TUTE' ? 'selected' : ''}>TUTE</option>
            <option value="OTHER" ${res.resourceType === 'OTHER' ? 'selected' : ''}>OTHER</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom:1rem;">
          <label class="form-label">Description</label>
          <textarea id="edit-res-desc" class="form-control" rows="3">${res.description || ''}</textarea>
        </div>

        ${(typeof authService !== 'undefined' && authService.getCurrentUser() && authService.getCurrentUser().role === 'ADMIN') ? `
        <div class="form-group" style="margin-bottom:1rem;">
          <label class="form-label">Status</label>
          <select id="edit-res-status" class="form-control">
            <option value="ACTIVE" ${res.status === 'ACTIVE' ? 'selected' : ''}>Active</option>
            <option value="INACTIVE" ${res.status === 'INACTIVE' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
        ` : ''}
      </form>
    `;

    UIService.openModal(
      "EDIT LEARNING RESOURCE",
      modalHtml,
      [
        { text: 'Cancel', className: 'btn-secondary', onClick: () => UIService.closeModal() },
        { 
          text: 'Save Changes', 
          className: 'btn-primary', 
          onClick: () => {
            const title = document.getElementById('edit-res-title').value;
            const subjectId = document.getElementById('edit-res-subject').value;
            const resourceType = document.getElementById('edit-res-type').value;
            const description = document.getElementById('edit-res-desc').value;
            const status = document.getElementById('edit-res-status') ? document.getElementById('edit-res-status').value : res.status;

            try {
              LearningResourceService.updateResource(resourceId, { title, subjectId, resourceType, description, status });
              UIService.showToast("Resource updated successfully!", "success");
              UIService.closeModal();
              App.renderCurrentView();
            } catch (err) {
              UIService.showToast(err.message, "danger");
            }
          } 
        }
      ]
    );
  },

  deleteResource(id) {
    UIService.showConfirm("Delete Resource", "Are you sure you want to delete this resource material?", () => {
      LearningResourceService.deleteResource(id);
      UIService.showToast("Resource deleted.", "info");
      App.renderCurrentView();
    });
  }
};

window.DigitalLearningView = DigitalLearningView;


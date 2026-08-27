/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - STUDENT MANAGEMENT (FIRESTORE CONNECTED)
   Bidirectional: Firestore ↔ GUI with real-time listeners.
   ========================================================================== */

const StudentsView = {
  _cachedStudents: [], // Holds latest snapshot for client-side search/filter

  render() {
    const departments = departmentService.getDepartments();
    const classes = classService.getClasses();

    return `
      <div class="page-header">
        <h1>Student Management</h1>
        <p>View, enroll, search, edit, and delete student records.</p>
      </div>

      <div class="toolbar">
        <div class="filter-group">
          <input type="text" id="student-search" class="search-input" style="width:240px; background:white;" placeholder="Search name, roll no..." onkeyup="StudentsView.onSearch(this.value)">
          <select id="student-dept-filter" class="form-select" onchange="StudentsView.onFilter()">
            <option value="">All Departments</option>
            ${departments.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}
          </select>
        </div>

        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          <button class="btn-primary" onclick="StudentsView.openAddModal()">
            <i data-lucide="user-plus"></i> Enroll Student
          </button>
          <button class="btn-secondary" onclick="BulkImportModal.open('STUDENT')" style="background:#F8FAFC; border-color:#CBD5E1; color:var(--color-navy-dark);">
            <i data-lucide="upload-cloud"></i> Import Students
          </button>
          <button class="btn-secondary" onclick="ExcelImportService.downloadStudentTemplate()" style="background:#F8FAFC; border-color:#CBD5E1; color:var(--color-navy-dark);">
            <i data-lucide="download"></i> Download Template
          </button>
        </div>
      </div>

      <div class="table-container">
        <table class="custom-table" id="students-table">
          <thead>
            <tr>
              <th>Roll No.</th>
              <th>Student Info</th>
              <th>Department</th>
              <th>Class/Section</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="students-table-body">
            <tr><td colspan="6" style="text-align:center; padding:2rem;"><i data-lucide="loader" class="spin"></i> Loading Students...</td></tr>
          </tbody>
        </table>
      </div>
    `;
  },

  afterRender() {
    // Start real-time listener
    studentService.listenToStudents((err, students) => {
      const tbody = document.getElementById('students-table-body');
      if (!tbody) return; // View navigated away

      if (err) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--color-danger);">${err.message}</td></tr>`;
        return;
      }

      this._cachedStudents = students;
      this._renderTableRows(students);
    });
  },

  _renderTableRows(students) {
    const tbody = document.getElementById('students-table-body');
    if (!tbody) return;

    if (students.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--color-text-muted);">No student records found.</td></tr>';
    } else {
      tbody.innerHTML = students.map(s => `
        <tr>
          <td><strong>${s.rollNumber || s.rollNo || '-'}</strong></td>
          <td>
            <div style="font-weight:600; color:var(--color-navy-dark);">${s.name || 'N/A'}</div>
            <div style="font-size:0.75rem; color:var(--color-text-muted);">${s.email || 'N/A'}</div>
          </td>
          <td>${s.department || 'N/A'}</td>
          <td>Sem ${s.semester || '-'} - Sec ${s.section || '-'}</td>
          <td><span class="status-badge ${s.status === 'ACTIVE' ? 'present' : 'absent'}">${s.status || 'N/A'}</span></td>
          <td>
            <div class="action-btns">
              <button class="btn-icon-sm" onclick="StudentsView.openEditModal('${s.id}')" title="Edit"><i data-lucide="edit-2"></i></button>
              <button class="btn-icon-sm danger" onclick="StudentsView.deleteStudent('${s.id}')" title="Delete"><i data-lucide="trash-2"></i></button>
            </div>
          </td>
        </tr>
      `).join('');
    }
    if (window.lucide) window.lucide.createIcons();
  },

  onSearch(query) {
    const q = (query || '').toLowerCase();
    if (!q) {
      this._renderTableRows(this._cachedStudents);
      return;
    }
    const filtered = this._cachedStudents.filter(s =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.rollNumber || s.rollNo || '').toLowerCase().includes(q) ||
      (s.registrationNumber || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q)
    );
    this._renderTableRows(filtered);
  },

  onFilter() {
    const dept = document.getElementById('student-dept-filter').value;
    if (!dept) {
      this._renderTableRows(this._cachedStudents);
      return;
    }
    const filtered = this._cachedStudents.filter(s => s.department === dept);
    this._renderTableRows(filtered);
  },

  openAddModal() {
    const depts = departmentService.getDepartments();

    const html = `
      <form id="add-student-form" onsubmit="return false;">
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">First Name *</label>
            <input type="text" id="m-stu-firstname" class="form-input" placeholder="e.g. Rahul" required>
          </div>
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <input type="text" id="m-stu-name" class="form-input" placeholder="e.g. Rahul Sharma" required>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Enrollment Year *</label>
            <select id="m-stu-year" class="form-select">
              <option value="2024">2024</option>
              <option value="2025" selected>2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Department *</label>
            <select id="m-stu-dept" class="form-select">
              <option value="" disabled selected>Select Department ▼</option>
              ${depts.map(d => `<option value="${d.code}">${d.name} (${d.code})</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Semester *</label>
            <select id="m-stu-sem" class="form-select">
              <option value="" disabled selected>Select Semester ▼</option>
              ${[1,2,3,4,5,6,7,8].map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Section *</label>
            <select id="m-stu-sec" class="form-select">
              <option value="" disabled selected>Select Section ▼</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Roll Number *</label>
            <input type="text" id="m-stu-roll" class="form-input" placeholder="e.g. 25eptcs006" required>
          </div>
          <div class="form-group">
            <label class="form-label">Registration Number *</label>
            <input type="text" id="m-stu-reg" class="form-input" placeholder="e.g. PIET25CS006" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Official Student Email (Auto-generated)</label>
          <div style="position:relative;">
            <i data-lucide="mail" style="position:absolute; left:1rem; top:50%; transform:translateY(-50%); color:var(--color-primary); width:16px; height:16px;"></i>
            <input type="email" id="m-stu-preview-email" class="form-input" readonly placeholder="Will be generated automatically..." style="padding-left:2.5rem; background-color: var(--color-bg-main); font-family: monospace; color: var(--color-primary); font-weight: 600;">
          </div>
        </div>
      </form>
    `;

    UIService.openModal("Add New Student", html, [
      { text: "Cancel", className: "btn-secondary", onClick: () => UIService.closeModal() },
      { text: "Add Student", className: "btn-primary", onClick: () => this.saveNewStudent() }
    ]);

    const previewFields = ['m-stu-firstname', 'm-stu-year', 'm-stu-dept', 'm-stu-reg'];
    previewFields.forEach(id => {
      const el = document.getElementById(id);
      if(el) {
        el.addEventListener('input', () => {
          const fn = document.getElementById('m-stu-firstname').value;
          const yr = document.getElementById('m-stu-year').value;
          const dp = document.getElementById('m-stu-dept').value;
          const rg = document.getElementById('m-stu-reg').value;
          const preview = studentService.generateOfficialEmail(fn, yr, dp, rg);
          document.getElementById('m-stu-preview-email').value = preview || "Pending...";
        });
      }
    });
    
    setTimeout(() => {
      if(window.lucide) window.lucide.createIcons();
    }, 10);
  },

  async saveNewStudent() {
    const studentData = {
      firstName: document.getElementById('m-stu-firstname').value,
      name: document.getElementById('m-stu-name').value,
      rollNumber: document.getElementById('m-stu-roll').value,
      registrationNumber: document.getElementById('m-stu-reg').value,
      department: document.getElementById('m-stu-dept').value,
      enrollmentYear: document.getElementById('m-stu-year').value,
      semester: document.getElementById('m-stu-sem').value,
      section: document.getElementById('m-stu-sec').value
    };

    try {
      await studentService.addStudent(studentData);
      UIService.closeModal();
      UIService.showToast("Student added successfully.", "success");
      // Real-time listener will auto-update the table
    } catch (err) {
      UIService.showToast(err.message, "danger");
    }
  },

  async openEditModal(docId) {
    // Fetch current data from Firestore, NOT from cache
    let stu;
    try {
      stu = await studentService.getStudentById(docId);
    } catch (err) {
      UIService.showToast(err.message, "danger");
      return;
    }
    if (!stu) {
      UIService.showToast("Student not found.", "danger");
      return;
    }

    const html = `
      <form id="edit-student-form">
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">First Name</label>
            <input type="text" id="m-edit-firstname" class="form-input" value="${stu.firstName || (stu.name || '').split(' ')[0]}">
          </div>
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" id="m-edit-name" class="form-input" value="${stu.name || ''}">
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Registration Number</label>
            <input type="text" id="m-edit-reg" class="form-input" value="${stu.registrationNumber || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Roll Number (Cannot Edit)</label>
            <input type="text" id="m-edit-roll" class="form-input" value="${stu.rollNumber || stu.rollNo || ''}" disabled>
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Semester</label>
            <select id="m-edit-sem" class="form-select">
              ${[1,2,3,4,5,6,7,8].map(s => `<option value="${s}" ${Number(stu.semester) === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Section</label>
            <select id="m-edit-sec" class="form-select">
              ${['A','B','C'].map(s => `<option value="${s}" ${stu.section === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select id="m-edit-status" class="form-select">
            <option value="ACTIVE" ${stu.status === 'ACTIVE' ? 'selected' : ''}>Active</option>
            <option value="INACTIVE" ${stu.status === 'INACTIVE' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
        <div style="margin-top:1rem; padding:0.75rem; background:#FEF3C7; border:1px solid #FDE68A; border-radius:6px;">
          <small style="color:#B45309; display:block; margin-bottom:0.25rem;">Official Generated Email:</small>
          <strong style="color:#B45309;" id="m-edit-preview-email">${stu.email || ''}</strong>
          <small style="color:#B45309; display:block; margin-top:0.25rem;">(Editing First Name or Registration Number will dynamically update the email)</small>
        </div>
      </form>
    `;

    UIService.openModal("Edit Student Details", html, [
      { text: "Cancel", className: "btn-secondary", onClick: () => UIService.closeModal() },
      { text: "Update Student", className: "btn-primary", onClick: async () => {
        try {
          const fn = document.getElementById('m-edit-firstname').value;
          const reg = document.getElementById('m-edit-reg').value;
          const newEmail = studentService.generateOfficialEmail(fn, stu.enrollmentYear, stu.department, reg);
          
          await studentService.updateStudent(docId, {
            firstName: fn,
            name: document.getElementById('m-edit-name').value,
            registrationNumber: reg,
            email: newEmail || stu.email,
            semester: Number(document.getElementById('m-edit-sem').value),
            section: document.getElementById('m-edit-sec').value,
            status: document.getElementById('m-edit-status').value
          });
          UIService.closeModal();
          UIService.showToast("Student updated successfully.", "success");
          // Real-time listener will auto-update the table
        } catch (e) {
          UIService.showToast(e.message, "danger");
        }
      }}
    ]);

    // Live preview for email
    const updatePreview = () => {
      const fn = document.getElementById('m-edit-firstname').value;
      const reg = document.getElementById('m-edit-reg').value;
      const preview = studentService.generateOfficialEmail(fn, stu.enrollmentYear, stu.department, reg);
      document.getElementById('m-edit-preview-email').innerText = preview;
    };
    document.getElementById('m-edit-firstname').addEventListener('input', updatePreview);
    document.getElementById('m-edit-reg').addEventListener('input', updatePreview);
  },

  deleteStudent(docId) {
    UIService.showConfirm("Delete Student?", "Are you sure you want to delete this student? This action cannot be undone.", async () => {
      try {
        await studentService.deleteStudent(docId);
        UIService.showToast("Student deleted successfully.", "success");
        // Real-time listener will auto-update the table
      } catch (err) {
        UIService.showToast(err.message, "danger");
      }
    });
  }
};

window.StudentsView = StudentsView;

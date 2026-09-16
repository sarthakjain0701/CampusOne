/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - PROFILE VIEW
   ========================================================================== */

const ProfileView = {
    loading: true,
  students: [],
  facultyList: [],

  afterRender() {
    if (this.loading) {
      this.fetchData();
    }
  },

  async fetchData() {
    try {
      this.students = typeof studentService !== 'undefined' && studentService.getStudentsFromFirestore ? await studentService.getStudentsFromFirestore() : (typeof studentService !== 'undefined' ? studentService.getStudents() : []);
      this.facultyList = typeof facultyService !== 'undefined' && facultyService.getFacultyFromFirestore ? await facultyService.getFacultyFromFirestore() : (typeof facultyService !== 'undefined' ? facultyService.getFaculty() : []);
      
      this.loading = false;
      App.renderCurrentView();
    } catch(e) {
      console.error(e);
      this.loading = false;
      App.renderCurrentView();
    }
  },

  render() {
    const user = authService.getCurrentUser() || { name: 'User Profile', email: 'user@poornima.edu.in', role: 'ADMIN', phone: '+91 98290 11223' };

    // Get role-specific details
    let roleDetails = '';
    if (user.role === 'STUDENT') {
      const students = typeof studentService !== 'undefined' ? studentService.getStudents() : [];
      const myStudent = students.find(s => s.email === user.email) || students[0];
      if (myStudent) {
        roleDetails = `
            <div class="info-group">
              <label>Roll Number</label>
              <p>${myStudent.rollNumber || myStudent.rollNo || 'N/A'}</p>
            </div>
            <div class="info-group">
              <label>Registration Number</label>
              <p><code>${myStudent.registrationNumber || 'N/A'}</code></p>
            </div>
            <div class="info-group">
              <label>Department</label>
              <p>${myStudent.department || 'Computer Science & Engineering'}</p>
            </div>
            <div class="info-group">
              <label>Semester</label>
              <p>Semester ${myStudent.semester || 'N/A'}</p>
            </div>
            <div class="info-group">
              <label>Section</label>
              <p>Section ${myStudent.section || 'A'}</p>
            </div>
        `;
      }
    } else if (user.role === 'FACULTY' || user.role === 'LAB_ASSISTANT') {
      const facultyList = this.facultyList || [];
      const myFaculty = facultyList.find(f => f.email === user.email) || facultyList[0];
      if (myFaculty) {
        const roleLabel = user.role === 'LAB_ASSISTANT' ? 'Lab Assistant' : 'Faculty';
        roleDetails = `
            <div class="info-group">
              <label>Staff Type</label>
              <p>${roleLabel}</p>
            </div>
            <div class="info-group">
              <label>Employee ID</label>
              <p>${myFaculty.employeeId || 'N/A'}</p>
            </div>
            <div class="info-group">
              <label>Department</label>
              <p>${myFaculty.department || 'Computer Science & Engineering'}</p>
            </div>
            <div class="info-group">
              <label>Designation</label>
              <p>${myFaculty.designation || roleLabel}</p>
            </div>
        `;
      }
    } else if (user.role === 'LIBRARIAN') {
      roleDetails = `
            <div class="info-group">
              <label>Staff Type</label>
              <p>Librarian</p>
            </div>
            <div class="info-group">
              <label>Access Level</label>
              <p>Library Management</p>
            </div>
      `;
    } else {
      roleDetails = `
            <div class="info-group">
              <label>Admin Level</label>
              <p>System Administrator</p>
            </div>
      `;
    }

    return `
      <style>
        .profile-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 768px) {
          .profile-layout {
            grid-template-columns: 300px 1fr;
          }
        }
        .profile-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }
        .info-group label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 0.25rem;
          letter-spacing: 0.05em;
        }
        .info-group p {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .info-group code {
          background: #F1F5F9;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          color: var(--poornima-deep-blue);
          font-weight: 700;
        }
      </style>

      <div class="page-header">
        <h1>User Profile</h1>
        <p>Personal details, role credentials, and contact information.</p>
      </div>

      <div class="profile-layout">
        <!-- Left Column: Avatar Card -->
        <div class="card" style="text-align:center; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 1.5rem;">
          <div class="avatar" style="width:110px; height:110px; font-size:2.5rem; margin-bottom: 1.25rem; box-shadow: 0 10px 25px rgba(37,99,235,0.15);">
            ${user.name.charAt(0)}
          </div>
          <h2 style="font-size:1.4rem; font-weight:800; color:var(--text-primary); margin-bottom: 0.25rem;">${user.name}</h2>
          <span class="role-badge ${user.role.toLowerCase().replace('_', '-')}" style="margin-bottom: 1rem;">${user.role.replace('_', ' ')}</span>
          <p style="font-size:0.9rem; color:var(--text-secondary); display:flex; align-items:center; gap:0.5rem; background: #F8FAFC; padding: 0.5rem 1rem; border-radius: 99px; border: 1px solid var(--border-color);">
            <i data-lucide="mail" style="width:14px; height:14px;"></i> ${user.email} 
            <button onclick="navigator.clipboard.writeText('${user.email}').then(() => UIService.showToast('Email copied', 'success'))" style="background:none; border:none; cursor:pointer; color:var(--poornima-blue); padding:0; display:flex;" title="Copy Email">
              <i data-lucide="copy" style="width:14px; height:14px;"></i>
            </button>
          </p>
        </div>

        <!-- Right Column: Details Card -->
        <div class="card">
          <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1rem;">
            <h3 class="card-title" style="display:flex; align-items:center; gap:0.5rem;"><i data-lucide="user-circle"></i> Profile Information</h3>
          </div>

          <div class="profile-info-grid">
            <div class="info-group">
              <label>Institution</label>
              <p>POORNIMA GROUP OF COLLEGE</p>
            </div>
            <div class="info-group">
              <label>Contact Phone</label>
              <p>${user.phone || '+91 98290 11223'}</p>
            </div>
            
            ${roleDetails}
          </div>

          <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px dashed var(--border-color);">
            <div class="info-group" style="display:flex; align-items:center; gap: 0.75rem;">
              <div style="background: rgba(16, 185, 129, 0.1); padding: 0.75rem; border-radius: 50%; color: var(--success);">
                <i data-lucide="shield-check"></i>
              </div>
              <div>
                <label>Security Status</label>
                <p style="color:var(--success); font-size:0.95rem;">Session Active — Authenticated</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

window.ProfileView = ProfileView;

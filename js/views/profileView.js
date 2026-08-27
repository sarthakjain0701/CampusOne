/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - PROFILE VIEW
   ========================================================================== */

const ProfileView = {
  render() {
    const user = authService.getCurrentUser() || { name: 'User Profile', email: 'user@poornima.edu.in', role: 'ADMIN', phone: '+91 98290 11223' };

    // Get role-specific details
    let roleDetails = '';
    if (user.role === 'STUDENT') {
      const students = studentService.getStudents();
      const myStudent = students.find(s => s.email === user.email) || students[0];
      if (myStudent) {
        roleDetails = `
            <div>
              <label style="font-size:0.75rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase;">Roll Number</label>
              <p style="font-size:0.95rem; font-weight:600; color:var(--color-navy-dark);">${myStudent.rollNumber || myStudent.rollNo || 'N/A'}</p>
            </div>
            <div>
              <label style="font-size:0.75rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase;">Registration Number</label>
              <p style="font-size:0.95rem; font-weight:600; color:var(--color-navy-dark);"><code style="background:#F1F5F9; padding:0.2rem 0.4rem; border-radius:4px;">${myStudent.registrationNumber || 'N/A'}</code></p>
            </div>
            <div>
              <label style="font-size:0.75rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase;">Department</label>
              <p style="font-size:0.95rem; font-weight:600; color:var(--color-navy-dark);">${myStudent.department || 'Computer Science & Engineering'}</p>
            </div>
            <div>
              <label style="font-size:0.75rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase;">Semester</label>
              <p style="font-size:0.95rem; font-weight:600; color:var(--color-navy-dark);">Semester ${myStudent.semester || 'N/A'}</p>
            </div>
            <div>
              <label style="font-size:0.75rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase;">Section</label>
              <p style="font-size:0.95rem; font-weight:600; color:var(--color-navy-dark);">Section ${myStudent.section || 'A'}</p>
            </div>
        `;
      }
    } else if (user.role === 'FACULTY' || user.role === 'LAB_ASSISTANT') {
      const facultyList = facultyService.getFaculty();
      const myFaculty = facultyList.find(f => f.email === user.email) || facultyList[0];
      if (myFaculty) {
        const roleLabel = user.role === 'LAB_ASSISTANT' ? 'Lab Assistant' : 'Faculty';
        roleDetails = `
            <div>
              <label style="font-size:0.75rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase;">Staff Type</label>
              <p style="font-size:0.95rem; font-weight:600; color:var(--color-navy-dark);">${roleLabel}</p>
            </div>
            <div>
              <label style="font-size:0.75rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase;">Employee ID</label>
              <p style="font-size:0.95rem; font-weight:600; color:var(--color-navy-dark);">${myFaculty.employeeId || 'N/A'}</p>
            </div>
            <div>
              <label style="font-size:0.75rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase;">Department</label>
              <p style="font-size:0.95rem; font-weight:600; color:var(--color-navy-dark);">${myFaculty.department || 'Computer Science & Engineering'}</p>
            </div>
            <div>
              <label style="font-size:0.75rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase;">Designation</label>
              <p style="font-size:0.95rem; font-weight:600; color:var(--color-navy-dark);">${myFaculty.designation || roleLabel}</p>
            </div>
        `;
      }
    } else if (user.role === 'LIBRARIAN') {
      roleDetails = `
            <div>
              <label style="font-size:0.75rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase;">Staff Type</label>
              <p style="font-size:0.95rem; font-weight:600; color:var(--color-navy-dark);">Librarian</p>
            </div>
            <div>
              <label style="font-size:0.75rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase;">Access Level</label>
              <p style="font-size:0.95rem; font-weight:600; color:var(--color-navy-dark);">Library Management</p>
            </div>
      `;
    } else {
      roleDetails = `
            <div>
              <label style="font-size:0.75rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase;">Admin Level</label>
              <p style="font-size:0.95rem; font-weight:600; color:var(--color-navy-dark);">System Administrator</p>
            </div>
      `;
    }

    return `
      <div class="page-header">
        <h1>User Profile</h1>
        <p>Personal details, role credentials, and contact information.</p>
      </div>

      <div class="dashboard-grid">
        <div class="card" style="text-align:center;">
          <div class="avatar" style="width:90px; height:90px; font-size:2rem; margin:0 auto 1rem auto; box-shadow:var(--shadow-lg);">
            ${user.name.charAt(0)}
          </div>
          <h2 style="font-size:1.35rem; font-weight:700; color:var(--color-navy-dark);">${user.name}</h2>
          <p style="font-size:0.85rem; color:var(--color-text-muted); margin-bottom:1rem; display:flex; align-items:center; justify-content:center; gap:0.5rem;">
            ${user.email} 
            <button onclick="navigator.clipboard.writeText('${user.email}').then(() => UIService.showToast('Email copied to clipboard', 'success'))" style="background:none; border:none; cursor:pointer; color:var(--color-primary);" title="Copy Email">
              <i data-lucide="copy" style="width:14px; height:14px;"></i>
            </button>
          </p>
          <span class="role-badge ${user.role.toLowerCase()}" style="font-size:0.8rem; padding:0.3rem 0.8rem;">${user.role}</span>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><i data-lucide="user"></i> Profile Information</h3>
          </div>

          <div style="display:flex; flex-direction:column; gap:1.25rem;">
            <div>
              <label style="font-size:0.75rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase;">Application System</label>
              <p style="font-size:0.95rem; font-weight:600; color:var(--color-navy-dark);">POORNIMA ATTENDANCE SYSTEM</p>
            </div>

            <div>
              <label style="font-size:0.75rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase;">System Short ID</label>
              <p style="font-size:0.95rem; font-weight:600; color:var(--color-navy-dark);">PAS v2.0</p>
            </div>

            <div>
              <label style="font-size:0.75rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase;">Contact Phone</label>
              <p style="font-size:0.95rem; font-weight:600; color:var(--color-navy-dark);">${user.phone || '+91 98290 11223'}</p>
            </div>

            ${roleDetails}

            <div>
              <label style="font-size:0.75rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase;">Security Status</label>
              <p style="font-size:0.85rem; color:var(--color-success); font-weight:600;"><i data-lucide="shield-check"></i> Session Active — Authenticated</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

window.ProfileView = ProfileView;


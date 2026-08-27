/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - HALL TICKET VIEW
   ========================================================================== */

const HallTicketView = {
  render() {
    const user = authService.getCurrentUser();
    
    // We only support student view for Hall Ticket downloading based on requirements, 
    // although Admin could publish it, we'll keep the view focused on Student.
    
    if (user.role !== 'STUDENT') {
      return `
        <div class="page-header">
          <h1>Hall Ticket Management</h1>
          <p>Admin features for publishing hall tickets would go here.</p>
        </div>
      `;
    }

    const ticket = hallTicketService.getHallTicket(user.id);
    const studentInfo = DataStore.get('STUDENTS').find(s => s.id === user.id);

    if (!ticket || ticket.status === 'NOT_AVAILABLE') {
      return `
        <div class="page-header">
          <h1>Hall Ticket</h1>
          <p>Download your examination hall ticket.</p>
        </div>
        <div style="text-align:center; padding:4rem 2rem; background:white; border-radius:12px; border:1px solid var(--color-border);">
          <div style="font-size:3rem; color:var(--color-text-light); margin-bottom:1rem;">📄</div>
          <h2 style="font-size:1.5rem; font-weight:700; color:var(--color-navy-dark); margin-bottom:0.5rem;">Hall ticket is not available yet.</h2>
          <p style="color:var(--color-text-muted);">Please check back later or wait for a notification from the administration.</p>
        </div>
      `;
    }

    const deptName = DataStore.get('DEPARTMENTS').find(d => studentInfo && d.name === studentInfo.department)?.name || studentInfo?.department || "N/A";

    // Build the hall ticket DOM string
    return `
      <div class="page-header no-print">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h1>Hall Ticket</h1>
            <p>Your hall ticket is available.</p>
          </div>
          <button class="btn-primary" onclick="window.print()">
            <i data-lucide="download"></i> Download Hall Ticket
          </button>
        </div>
      </div>

      <!-- Printable Hall Ticket Area -->
      <div class="hall-ticket-container printable-area" style="background:white; padding:2rem; border-radius:12px; border:1px solid var(--color-border); max-width:800px; margin:0 auto; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="text-align:center; border-bottom:2px solid var(--color-navy-dark); padding-bottom:1.5rem; margin-bottom:1.5rem;">
          <h2 style="font-size:1.5rem; font-weight:800; color:var(--color-navy-dark); text-transform:uppercase; margin:0;">Poornima Group of Education</h2>
          <h3 style="font-size:1.1rem; font-weight:600; color:var(--color-text-main); margin:0.5rem 0;">EXAMINATION HALL TICKET</h3>
          <p style="font-weight:600; color:var(--color-text-muted); margin:0;">${ticket.examName} (${ticket.academicYear})</p>
        </div>

        <!-- Student Info -->
        <div style="display:grid; grid-template-columns: 1fr 150px; gap: 2rem; margin-bottom: 2rem;">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem 2rem; font-size:0.9rem;">
            <div>
              <strong style="color:var(--color-text-muted); font-size:0.8rem; display:block;">Student Name</strong>
              <span style="font-weight:600; color:var(--color-navy-dark);">${studentInfo?.name || user.name}</span>
            </div>
            <div>
              <strong style="color:var(--color-text-muted); font-size:0.8rem; display:block;">Roll Number</strong>
              <span style="font-weight:600; color:var(--color-navy-dark);">${studentInfo?.rollNumber || studentInfo?.rollNo || 'N/A'}</span>
            </div>
            <div>
              <strong style="color:var(--color-text-muted); font-size:0.8rem; display:block;">Registration Number</strong>
              <span style="font-weight:600; color:var(--color-navy-dark);">${studentInfo?.registrationNumber || 'N/A'}</span>
            </div>
            <div>
              <strong style="color:var(--color-text-muted); font-size:0.8rem; display:block;">Department</strong>
              <span style="font-weight:600; color:var(--color-navy-dark);">${deptName}</span>
            </div>
            <div>
              <strong style="color:var(--color-text-muted); font-size:0.8rem; display:block;">Semester</strong>
              <span style="font-weight:600; color:var(--color-navy-dark);">${ticket.semester}</span>
            </div>
            <div>
              <strong style="color:var(--color-text-muted); font-size:0.8rem; display:block;">Section</strong>
              <span style="font-weight:600; color:var(--color-navy-dark);">${studentInfo?.section || 'A'}</span>
            </div>
          </div>
          
          <!-- Photo Placeholder -->
          <div style="width:120px; height:150px; border:2px dashed var(--color-border); display:flex; align-items:center; justify-content:center; background:var(--color-bg-light); border-radius:8px;">
            <i data-lucide="user" style="width:48px; height:48px; color:var(--color-text-light);"></i>
          </div>
        </div>

        <!-- Subjects Table -->
        <div style="margin-bottom: 2rem;">
          <h4 style="font-size:1rem; font-weight:700; color:var(--color-navy-dark); margin-bottom:1rem; border-bottom:1px solid var(--color-border); padding-bottom:0.5rem;">Subject Details</h4>
          <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
            <thead>
              <tr style="background:var(--color-bg-light); border-bottom:2px solid var(--color-border);">
                <th style="padding:0.75rem; text-align:left; font-weight:600;">Code</th>
                <th style="padding:0.75rem; text-align:left; font-weight:600;">Subject Name</th>
                <th style="padding:0.75rem; text-align:left; font-weight:600;">Exam Date</th>
                <th style="padding:0.75rem; text-align:left; font-weight:600;">Exam Time</th>
              </tr>
            </thead>
            <tbody>
              ${ticket.subjects.map(s => `
                <tr style="border-bottom:1px solid var(--color-border);">
                  <td style="padding:0.75rem;"><strong>${s.code}</strong></td>
                  <td style="padding:0.75rem;">${s.name}</td>
                  <td style="padding:0.75rem;">${s.date}</td>
                  <td style="padding:0.75rem;">${s.time}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Exam Center & Instructions -->
        <div style="display:grid; grid-template-columns: 1fr; gap: 1.5rem; background:#F8FAFC; padding:1.5rem; border-radius:8px; border:1px solid #E2E8F0;">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <strong style="color:var(--color-navy-dark); font-size:0.85rem; display:block; text-transform:uppercase;">Examination Center</strong>
              <span style="font-weight:600; color:var(--color-text-main);">${ticket.examCenter}</span>
            </div>
            <div>
              <strong style="color:var(--color-navy-dark); font-size:0.85rem; display:block; text-transform:uppercase;">Room Number</strong>
              <span style="font-weight:600; color:var(--color-text-main);">${ticket.roomNumber}</span>
            </div>
          </div>
          <div>
            <strong style="color:var(--color-navy-dark); font-size:0.85rem; display:block; text-transform:uppercase; margin-bottom:0.5rem;">Important Instructions</strong>
            <pre style="margin:0; white-space:pre-wrap; font-family:inherit; font-size:0.85rem; color:var(--color-text-muted); line-height:1.5;">${ticket.instructions}</pre>
          </div>
        </div>

        <!-- Signatures -->
        <div style="display:flex; justify-content:space-between; margin-top:4rem; padding-top:1rem;">
          <div style="text-align:center; width:200px; border-top:1px solid var(--color-text-main); padding-top:0.5rem;">
            <span style="font-size:0.85rem; font-weight:600; color:var(--color-text-main);">Student Signature</span>
          </div>
          <div style="text-align:center; width:200px; border-top:1px solid var(--color-text-main); padding-top:0.5rem;">
            <span style="font-size:0.85rem; font-weight:600; color:var(--color-text-main);">Controller of Examinations</span>
          </div>
        </div>
      </div>
    `;
  }
};

window.HallTicketView = HallTicketView;


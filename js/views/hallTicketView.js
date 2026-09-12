/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - HALL TICKET VIEW
   ========================================================================== */

const HallTicketView = {
  loading: true,
  ticket: null,
  studentInfo: null,
  examForm: null,
  examPeriod: null,
  allSubjects: [],
  departments: [],
  
  afterRender() {
    if (this.loading) {
      this.fetchData();
    }
  },

  async fetchData() {
    try {
      const user = authService.getCurrentUser();
      if (!user || user.role !== 'STUDENT') {
        this.loading = false;
        App.renderCurrentView();
        return;
      }

      this.ticket = typeof hallTicketService !== 'undefined' ? await hallTicketService.getHallTicket(user.id) : null;
      
      const students = typeof studentService !== 'undefined' && studentService.getStudentsFromFirestore ? await studentService.getStudentsFromFirestore() : (typeof studentService !== 'undefined' ? studentService.getStudents() : []);
      this.studentInfo = students.find(s => s.id === user.id) || null;

      this.departments = typeof departmentService !== 'undefined' && departmentService.getDepartmentsFromFirestore ? await departmentService.getDepartmentsFromFirestore() : (typeof departmentService !== 'undefined' ? departmentService.getDepartments() : []);
      
      this.allSubjects = typeof subjectService !== 'undefined' && subjectService.getSubjectsFromFirestore ? await subjectService.getSubjectsFromFirestore() : (typeof subjectService !== 'undefined' ? subjectService.getSubjects() : []);
      
      if (this.ticket && typeof ExamFormService !== 'undefined') {
        this.examForm = await ExamFormService.getExamFormById(this.ticket.examFormId);
        const periods = await ExamFormService.getExamPeriods();
        this.examPeriod = periods.find(p => p.id === this.ticket.examId);
      }
      
      this.loading = false;
      App.renderCurrentView();
    } catch(e) {
      console.error(e);
      this.loading = false;
      App.renderCurrentView();
    }
  },

  render() {
    const user = authService.getCurrentUser();
    
    // We only support student view for Hall Ticket downloading based on requirements
    if (user.role !== 'STUDENT') {
      return `
        <div class="page-header">
          <h1>Hall Ticket Management</h1>
          <p>Admin features for publishing hall tickets are located in Exam Form Management.</p>
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
        <div class="card" style="text-align:center; padding:4rem 2rem;">
          <div style="font-size:3rem; color:var(--color-text-light); margin-bottom:1rem;">📄</div>
          <h2 style="font-size:1.5rem; font-weight:700; color:var(--color-navy-dark); margin-bottom:0.5rem;">Hall ticket is not available yet.</h2>
          <p style="color:var(--color-text-muted);">Please check back later or wait for a notification from the administration.</p>
        </div>
      `;
    }

    // Resolve relational data dynamically as requested
    const examForm = this.examForm;
    const examPeriod = this.examPeriod;
    const allSubjects = this.allSubjects || [];
    
    const deptName = this.departments.find(d => studentInfo && (d.name === studentInfo.department || d.id === studentInfo.departmentId))?.name || studentInfo?.department || "N/A";
    const examName = examPeriod?.name || "End Semester Examination";
    const academicYear = examPeriod?.academicYear || "2026-27";
    const semester = examPeriod?.semester || examForm?.semester || studentInfo?.semester || "N/A";

    // Build the list of subjects from the exam form
    let subjectsHtml = '';
    if (examForm && examForm.selectedSubjectIds) {
      const selectedSubjects = allSubjects.filter(s => examForm.selectedSubjectIds.includes(s.id));
      if (selectedSubjects.length > 0) {
        subjectsHtml = selectedSubjects.map(s => {
          // Display actual exam dates/times if available, otherwise display TBA to avoid inventing data
          const dateStr = examPeriod?.startDate ? new Date(examPeriod.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA';
          const timeStr = 'TBA'; // Assuming no specific time is stored in the current mock model
          
          return `
            <tr>
              <td style="border:1px solid #333; padding:10px 12px; font-weight:bold;">${s.code}</td>
              <td style="border:1px solid #333; padding:10px 12px;">${s.name}</td>
              <td style="border:1px solid #333; padding:10px 12px; text-align:center;">${dateStr}</td>
              <td style="border:1px solid #333; padding:10px 12px; text-align:center;">${timeStr}</td>
            </tr>
          `;
        }).join('');
      } else {
        subjectsHtml = `<tr><td colspan="4" style="border:1px solid #333; padding:12px; text-align:center;">No subjects found for this registration.</td></tr>`;
      }
    } else {
      subjectsHtml = `<tr><td colspan="4" style="border:1px solid #333; padding:12px; text-align:center;">No subjects found for this registration.</td></tr>`;
    }

    // Build the hall ticket DOM string
    return `
      <div class="page-header no-print">
        <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
          <div>
            <h1 style="font-size:1.75rem; font-weight:800; color:var(--color-navy-dark); margin:0 0 0.25rem 0;">Hall Ticket</h1>
            <p style="color:var(--color-text-muted); font-size:0.9rem; margin:0;">Download and print your examination hall ticket.</p>
          </div>
          <div style="display:flex; gap:1rem;">
            <button class="btn-secondary" onclick="window.print()">
              <i data-lucide="download" style="width:18px; height:18px;"></i> Save as PDF
            </button>
            <button class="btn-primary" onclick="window.print()">
              <i data-lucide="printer" style="width:18px; height:18px;"></i> Print Hall Ticket
            </button>
          </div>
        </div>
      </div>

      <!-- Printable Hall Ticket Area -->
      <div class="hall-ticket-container printable-area" style="background:white; padding:40px; border-radius:12px; border:1px solid var(--color-border); max-width:850px; margin:0 auto; box-shadow:var(--glass-shadow); color: #000; font-family: 'Times New Roman', Times, serif; line-height:1.5;">
        
        <!-- Header -->
        <div style="display:flex; align-items:center; border-bottom:3px solid #000; padding-bottom:20px; margin-bottom:24px;">
          <img src="https://images.shiksha.com/mediadata/images/1684410058phpjSEJOU.jpeg" alt="Logo" style="height:90px; margin-right:24px;">
          <div style="flex:1; text-align:center;">
            <h2 style="font-size:28px; font-weight:900; text-transform:uppercase; margin:0; letter-spacing:1px; font-family: 'Arial', sans-serif;">POORNIMA GROUP OF COLLEGE</h2>
            <h3 style="font-size:20px; font-weight:bold; margin:12px 0 6px; letter-spacing:2px; text-decoration:underline;">EXAMINATION HALL TICKET</h3>
            <p style="font-weight:bold; margin:0; font-size:16px;">${examName} - Academic Year: ${academicYear}</p>
          </div>
        </div>

        <!-- Student Info -->
        <div style="display:flex; justify-content:space-between; margin-bottom: 24px;">
          <div style="flex:1;">
            <table style="width:100%; border-collapse:collapse; font-size:16px;">
              <tr>
                <td style="padding:6px 0; width:180px;"><strong>Candidate Name:</strong></td>
                <td style="padding:6px 0; font-weight:bold; text-transform:uppercase;">${studentInfo?.name || user.name}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;"><strong>Roll Number:</strong></td>
                <td style="padding:6px 0;">${studentInfo?.rollNumber || studentInfo?.rollNo || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;"><strong>Registration No:</strong></td>
                <td style="padding:6px 0;">${studentInfo?.registrationNumber || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;"><strong>Department:</strong></td>
                <td style="padding:6px 0;">${deptName}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;"><strong>Semester:</strong></td>
                <td style="padding:6px 0;">${semester}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;"><strong>Section:</strong></td>
                <td style="padding:6px 0;">${studentInfo?.section || 'A'}</td>
              </tr>
            </table>
          </div>
          
          <!-- Photo Placeholder -->
          <div style="width:130px; height:160px; border:2px solid #000; display:flex; align-items:center; justify-content:center; margin-left:30px; background:#f9f9f9;">
            <span style="color:#666; font-size:13px; text-align:center; padding:10px;">Affix Recent<br>Passport Photo</span>
          </div>
        </div>

        <!-- Subjects Table -->
        <div style="margin-bottom: 30px;">
          <h4 style="font-size:18px; font-weight:bold; margin-bottom:12px; border-bottom:2px solid #000; padding-bottom:5px; text-transform:uppercase;">Examination Schedule</h4>
          <table style="width:100%; border-collapse:collapse; font-size:15px;">
            <thead>
              <tr>
                <th style="border:1px solid #333; padding:10px; text-align:left; background:#e0e0e0; font-weight:bold; width:15%;">Subject Code</th>
                <th style="border:1px solid #333; padding:10px; text-align:left; background:#e0e0e0; font-weight:bold; width:45%;">Subject Name</th>
                <th style="border:1px solid #333; padding:10px; text-align:center; background:#e0e0e0; font-weight:bold; width:20%;">Exam Date</th>
                <th style="border:1px solid #333; padding:10px; text-align:center; background:#e0e0e0; font-weight:bold; width:20%;">Time</th>
              </tr>
            </thead>
            <tbody>
              ${subjectsHtml}
            </tbody>
          </table>
        </div>

        <!-- Exam Center & Instructions -->
        <div style="margin-bottom: 50px; border:1px solid #000; padding:15px; border-radius:4px;">
          <h4 style="font-size:15px; font-weight:bold; margin:0 0 10px; text-transform:uppercase; text-decoration:underline;">Important Instructions to Candidates</h4>
          <ol style="margin:0; padding-left:24px; font-size:13px; line-height:1.6;">
            <li>The candidate must carry this Hall Ticket and a valid College ID Card to the examination hall.</li>
            <li>Electronic devices including mobile phones, programmable calculators, and smartwatches are strictly prohibited inside the examination premises.</li>
            <li>Candidates must report to the examination hall at least 30 minutes before the commencement of the exam.</li>
            <li>No candidate will be allowed to enter the examination hall after 30 minutes from the start time, and no candidate is allowed to leave before 1 hour has elapsed.</li>
            <li>Malpractice of any form will lead to immediate confiscation of the answer booklet and strict disciplinary action.</li>
          </ol>
        </div>

        <!-- Signatures -->
        <div style="display:flex; justify-content:space-between; margin-top:80px; padding:0 20px;">
          <div style="text-align:center; width:250px; border-top:1px solid #000; padding-top:10px;">
            <span style="font-size:15px; font-weight:bold;">Signature of Candidate</span>
          </div>
          
          <div style="text-align:center; width:150px; position:relative; top:-60px;">
            <div style="width:100px; height:100px; border:2px dashed #ccc; border-radius:50%; margin:0 auto 10px; display:flex; align-items:center; justify-content:center;">
              <span style="font-size:12px; color:#999;">College Seal</span>
            </div>
          </div>
          
          <div style="text-align:center; width:250px; border-top:1px solid #000; padding-top:10px;">
            <span style="font-size:15px; font-weight:bold;">Controller of Examinations</span>
          </div>
        </div>
      </div>
    `;
  }
};

window.HallTicketView = HallTicketView;

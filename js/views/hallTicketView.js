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
    const examName = examPeriod?.name || "Examination";
    const academicYear = examPeriod?.academicYear || "2026-27";
    const semester = examPeriod?.semester || examForm?.semester || studentInfo?.semester || "N/A";

    // Build the list of subjects from the exam form
    let subjectsHtml = '';
    if (examForm && examForm.selectedSubjectIds) {
      const selectedSubjects = allSubjects.filter(s => examForm.selectedSubjectIds.includes(s.id));
      if (selectedSubjects.length > 0) {
        subjectsHtml = selectedSubjects.map(s => {
          // Defaulting to empty string for missing schedule data to not "invent" data
          const date = examPeriod?.startDate ? new Date(examPeriod.startDate).toLocaleDateString() : '';
          const time = '';
          return `
            <tr>
              <td style="border:1px solid #333; padding:8px;"><strong>${s.code}</strong></td>
              <td style="border:1px solid #333; padding:8px;">${s.name}</td>
              <td style="border:1px solid #333; padding:8px;">${date}</td>
              <td style="border:1px solid #333; padding:8px;">${time}</td>
            </tr>
          `;
        }).join('');
      } else {
        subjectsHtml = `<tr><td colspan="4" style="border:1px solid #333; padding:8px; text-align:center;">No subjects found for this registration.</td></tr>`;
      }
    } else {
      subjectsHtml = `<tr><td colspan="4" style="border:1px solid #333; padding:8px; text-align:center;">No subjects found for this registration.</td></tr>`;
    }

    // Build the hall ticket DOM string
    return `
      <div class="page-header no-print">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h1>Hall Ticket</h1>
            <p>Your hall ticket is available.</p>
          </div>
          <button class="btn-primary" onclick="window.print()">
            <i data-lucide="printer"></i> Print Hall Ticket
          </button>
        </div>
      </div>

      <!-- Printable Hall Ticket Area -->
      <div class="hall-ticket-container printable-area" style="background:white; padding:40px; border-radius:12px; border:1px solid var(--color-border); max-width:800px; margin:0 auto; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1); color: #000; font-family: 'Times New Roman', serif;">
        
        <!-- Header -->
        <div style="display:flex; align-items:center; border-bottom:2px solid #000; padding-bottom:20px; margin-bottom:20px;">
          <img src="https://images.shiksha.com/mediadata/images/1684410058phpjSEJOU.jpeg" alt="Logo" style="height:80px; margin-right:20px;">
          <div style="flex:1; text-align:center;">
            <h2 style="font-size:24px; font-weight:bold; text-transform:uppercase; margin:0;">Poornima Group of College</h2>
            <h3 style="font-size:18px; font-weight:bold; margin:8px 0;">EXAMINATION HALL TICKET</h3>
            <p style="font-weight:bold; margin:0;">${examName} - Academic Year: ${academicYear}</p>
          </div>
        </div>

        <!-- Student Info -->
        <div style="display:flex; justify-content:space-between; margin-bottom: 20px;">
          <div style="flex:1;">
            <table style="width:100%; border-collapse:collapse; font-size:14px;">
              <tr>
                <td style="padding:4px 0; width:150px;"><strong>Name:</strong></td>
                <td style="padding:4px 0;">${studentInfo?.name || user.name}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;"><strong>Roll Number:</strong></td>
                <td style="padding:4px 0;">${studentInfo?.rollNumber || studentInfo?.rollNo || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;"><strong>Registration Number:</strong></td>
                <td style="padding:4px 0;">${studentInfo?.registrationNumber || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;"><strong>Department:</strong></td>
                <td style="padding:4px 0;">${deptName}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;"><strong>Semester:</strong></td>
                <td style="padding:4px 0;">${semester}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;"><strong>Section:</strong></td>
                <td style="padding:4px 0;">${studentInfo?.section || 'A'}</td>
              </tr>
            </table>
          </div>
          
          <!-- Photo Placeholder -->
          <div style="width:120px; height:150px; border:1px solid #000; display:flex; align-items:center; justify-content:center; margin-left:20px;">
            <span style="color:#666; font-size:12px;">Affix Photo Here</span>
          </div>
        </div>

        <!-- Subjects Table -->
        <div style="margin-bottom: 30px;">
          <h4 style="font-size:16px; font-weight:bold; margin-bottom:10px; border-bottom:1px solid #000; padding-bottom:5px;">Examination Schedule</h4>
          <table style="width:100%; border-collapse:collapse; font-size:14px;">
            <thead>
              <tr>
                <th style="border:1px solid #333; padding:8px; text-align:left; background:#f0f0f0;">Subject Code</th>
                <th style="border:1px solid #333; padding:8px; text-align:left; background:#f0f0f0;">Subject Name</th>
                <th style="border:1px solid #333; padding:8px; text-align:left; background:#f0f0f0;">Exam Date</th>
                <th style="border:1px solid #333; padding:8px; text-align:left; background:#f0f0f0;">Exam Time</th>
              </tr>
            </thead>
            <tbody>
              ${subjectsHtml}
            </tbody>
          </table>
        </div>

        <!-- Exam Center & Instructions -->
        <div style="margin-bottom: 40px;">
          <h4 style="font-size:14px; font-weight:bold; margin-bottom:5px; text-transform:uppercase;">Important Instructions</h4>
          <ol style="margin:0; padding-left:20px; font-size:12px; line-height:1.5;">
            <li>The candidate must carry this Hall Ticket and a valid College ID Card to the examination hall.</li>
            <li>Electronic devices including mobile phones and smartwatches are strictly prohibited.</li>
            <li>Candidates must report to the examination hall 30 minutes before the commencement of the exam.</li>
            <li>No candidate will be allowed to enter the examination hall after 30 minutes from the start time.</li>
          </ol>
        </div>

        <!-- Signatures -->
        <div style="display:flex; justify-content:space-between; margin-top:60px;">
          <div style="text-align:center; width:200px; border-top:1px solid #000; padding-top:10px;">
            <span style="font-size:14px; font-weight:bold;">Candidate Signature</span>
          </div>
          <div style="text-align:center; width:200px; border-top:1px solid #000; padding-top:10px;">
            <span style="font-size:14px; font-weight:bold;">Controller of Examinations</span>
          </div>
        </div>
      </div>
    `;
  }
};

window.HallTicketView = HallTicketView;


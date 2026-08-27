/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAMS) - DIGITAL ID CARD VIEW
   Supports Student & Faculty Identity Cards with Unique QR Code Verification
   ========================================================================== */

const DigitalIdView = {
  activeTab: 'STUDENT', // Default tab for Admin selector

  render(params = {}) {
    const user = authService.getCurrentUser();
    if (!user) return `<div class="card" style="padding:2rem; text-align:center;">Please log in to view Digital ID Card.</div>`;

    const userRole = user.role;
    let isStudentView = userRole === 'STUDENT';
    let isFacultyView = userRole === 'FACULTY' || userRole === 'LAB_ASSISTANT';

    if (userRole === 'ADMIN') {
      if (params.tab) this.activeTab = params.tab;
      isStudentView = this.activeTab === 'STUDENT';
      isFacultyView = this.activeTab === 'FACULTY';
    }

    return `
      <div class="page-header">
        <div>
          <h1>Digital ID Card</h1>
          <p>Official Poornima Institute digital identity card with QR verification code.</p>
        </div>
      </div>

      ${userRole === 'ADMIN' ? `
        <!-- ADMIN ROLE TOGGLE SWITCHER -->
        <div style="display:flex; justify-content:center; margin-bottom:1.5rem;">
          <div style="background:var(--color-bg-light); padding:0.25rem; border-radius:10px; display:inline-flex; border:1px solid var(--color-border);">
            <button class="btn-sm ${isStudentView ? 'btn-primary' : 'btn-secondary'}" onclick="DigitalIdView.switchTab('STUDENT')" style="border-radius:8px; border:none;">
              <i data-lucide="graduation-cap"></i> Student Digital ID
            </button>
            <button class="btn-sm ${isFacultyView ? 'btn-primary' : 'btn-secondary'}" onclick="DigitalIdView.switchTab('FACULTY')" style="border-radius:8px; border:none; margin-left:0.25rem;">
              <i data-lucide="users"></i> Faculty Digital ID
            </button>
          </div>
        </div>
      ` : ''}

      ${isFacultyView ? this.renderFacultyCard(user) : this.renderStudentCard(user)}
    `;
  },

  switchTab(tabName) {
    this.activeTab = tabName;
    App.renderCurrentView();
  },

  renderStudentCard(currentUser) {
    const students = DataStore.get('STUDENTS');
    let student = students.find(s => s.email === currentUser.email || s.id === currentUser.id);
    if (!student) student = students[0]; // Fallback to first student record

    const qrCodeString = QRService.generateStudentQR(student.id);
    const qrSvg = QRGenerator.generateSVG(qrCodeString, { size: 160, padding: 8 });

    const name = student.name || currentUser.name || "Student Name";
    const regNo = student.registrationNumber || student.rollNo || student.rollNumber || "REG-2026-001";
    const studentId = student.studentId || student.id || "STU001";
    const email = student.email || currentUser.email || "student@example.com";
    const department = student.department || "Computer Science & Engineering";
    const course = student.course || "B.Tech CSE";
    const section = student.section || "A";
    const batch = student.batch || "2024–2028";
    const semester = student.semester || 2;
    const session = student.academicSession || student.academicYear || "2026–27";

    return `
      <div style="display:flex; flex-direction:column; align-items:center; padding:1rem 0;">
        
        <!-- CARD CONTAINER (PRINTABLE AREA) -->
        <div id="digital-id-card" class="printable-area" style="width:420px; max-width:100%; background:linear-gradient(135deg, #0F172A 0%, #1E3A5F 60%, #0F172A 100%); border-radius:18px; box-shadow:0 20px 40px rgba(15,23,42,0.3); overflow:hidden; position:relative; color:white; font-family:Inter, sans-serif; border:1px solid rgba(255,255,255,0.15);">
          
          <!-- TOP HEADER BANNER -->
          <div style="background:linear-gradient(90deg, #1E40AF 0%, #3B82F6 100%); padding:1.1rem 1.5rem; display:flex; align-items:center; gap:0.85rem; border-bottom:2px solid rgba(255,255,255,0.15);">
            <div style="width:44px; height:44px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:0.85rem; color:#1E40AF; box-shadow:0 2px 8px rgba(0,0,0,0.2);">PAS</div>
            <div>
              <div style="font-size:0.7rem; font-weight:700; color:rgba(255,255,255,0.85); text-transform:uppercase; letter-spacing:1px;">POORNIMA ATTENDANCE SYSTEM</div>
              <div style="font-size:1.05rem; font-weight:800; color:white; letter-spacing:0.5px;">DIGITAL STUDENT ID CARD</div>
            </div>
          </div>

          <!-- CARD CONTENT BODY -->
          <div style="padding:1.5rem; display:grid; grid-template-columns:1fr 140px; gap:1.25rem; align-items:flex-start;">
            
            <!-- LEFT DETAILS -->
            <div style="font-size:0.82rem; display:flex; flex-direction:column; gap:0.35rem;">
              <div style="font-size:1.2rem; font-weight:800; color:#F8FAFC; margin-bottom:0.4rem; border-bottom:1px solid rgba(255,255,255,0.15); padding-bottom:0.4rem;">
                ${name}
              </div>

              <div style="display:flex; justify-content:space-between; gap:0.5rem;">
                <span style="color:rgba(255,255,255,0.6);">Registration No:</span>
                <strong style="color:#93C5FD;">${regNo}</strong>
              </div>


              <div style="display:flex; justify-content:space-between; gap:0.5rem;">
                <span style="color:rgba(255,255,255,0.6);">Email:</span>
                <strong style="color:#E2E8F0; font-size:0.75rem; word-break:break-all;">${email}</strong>
              </div>

              <div style="display:flex; justify-content:space-between; gap:0.5rem;">
                <span style="color:rgba(255,255,255,0.6);">Department:</span>
                <strong style="color:#E2E8F0; text-align:right;">${department}</strong>
              </div>

              <div style="display:flex; justify-content:space-between; gap:0.5rem;">
                <span style="color:rgba(255,255,255,0.6);">Course:</span>
                <strong style="color:#E2E8F0;">${course}</strong>
              </div>

              <div style="display:flex; justify-content:space-between; gap:0.5rem;">
                <span style="color:rgba(255,255,255,0.6);">Section:</span>
                <strong style="color:#E2E8F0;">${section}</strong>
              </div>

              <div style="display:flex; justify-content:space-between; gap:0.5rem;">
                <span style="color:rgba(255,255,255,0.6);">Batch:</span>
                <strong style="color:#E2E8F0;">${batch}</strong>
              </div>

              <div style="display:flex; justify-content:space-between; gap:0.5rem;">
                <span style="color:rgba(255,255,255,0.6);">Semester:</span>
                <strong style="color:#E2E8F0;">Semester ${semester}</strong>
              </div>

              <div style="display:flex; justify-content:space-between; gap:0.5rem;">
                <span style="color:rgba(255,255,255,0.6);">Academic Session:</span>
                <strong style="color:#E2E8F0;">${session}</strong>
              </div>
            </div>

            <!-- RIGHT COLUMN: PHOTO & QR -->
            <div style="display:flex; flex-direction:column; align-items:center; gap:0.85rem;">
              
              <!-- STUDENT PHOTO PLACEHOLDER -->
              <div style="width:105px; height:120px; background:linear-gradient(135deg, #334155, #475569); border-radius:10px; border:2px solid rgba(255,255,255,0.25); display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.3);">
                <div style="font-size:2.8rem; font-weight:800; color:rgba(255,255,255,0.85);">${name.charAt(0)}</div>
              </div>

              <!-- QR CODE BLOCK -->
              <div style="background:white; padding:6px; border-radius:8px; border:2px solid #3B82F6; box-shadow:0 4px 12px rgba(0,0,0,0.2); text-align:center;">
                ${qrSvg}
                <div style="font-size:0.58rem; font-weight:800; color:#0F172A; margin-top:2px; letter-spacing:0.5px;">VERIFY ID QR</div>
              </div>

            </div>

          </div>

          <!-- BOTTOM FOOTER -->
          <div style="background:rgba(0,0,0,0.3); padding:0.6rem 1.5rem; border-top:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center; font-size:0.7rem; color:rgba(255,255,255,0.6);">
            <div>Status: <span style="color:#4ADE80; font-weight:700;">● VERIFIED ACTIVE</span></div>
            <div>Valid for Academic Session ${session}</div>
          </div>

        </div>

        <!-- BUTTON ACTIONS -->
        <div style="display:flex; gap:1rem; margin-top:1.5rem;">
          <button class="btn-primary" onclick="DigitalIdView.printCard()">
            <i data-lucide="printer"></i> Print ID Card
          </button>
          <button class="btn-secondary" onclick="DigitalIdView.downloadCard()">
            <i data-lucide="download"></i> Download Digital ID
          </button>
        </div>

      </div>
    `;
  },

  renderFacultyCard(currentUser) {
    const facultyList = DataStore.get('FACULTY');
    let fac = facultyList.find(f => f.email === currentUser.email || f.id === currentUser.id);
    if (!fac) fac = facultyList[0]; // Fallback to first faculty record

    const qrCodeString = QRService.generateFacultyQR(fac.id);
    const qrSvg = QRGenerator.generateSVG(qrCodeString, { size: 160, padding: 8 });

    const name = fac.name || currentUser.name || "Faculty Name";
    const facultyId = fac.facultyId || fac.id || "FAC001";
    const email = fac.email || currentUser.email || "faculty@pas.demo";
    const department = fac.department || "Computer Science & Engineering";
    const designation = fac.designation || "Associate Professor";
    const empNo = fac.employeeNumber || fac.employeeId || "EMP-FAC-101";

    return `
      <div style="display:flex; flex-direction:column; align-items:center; padding:1rem 0;">
        
        <!-- CARD CONTAINER (PRINTABLE AREA) -->
        <div id="digital-id-card" class="printable-area" style="width:420px; max-width:100%; background:linear-gradient(135deg, #1E1B4B 0%, #312E81 60%, #1E1B4B 100%); border-radius:18px; box-shadow:0 20px 40px rgba(30,27,75,0.35); overflow:hidden; position:relative; color:white; font-family:Inter, sans-serif; border:1px solid rgba(255,255,255,0.15);">
          
          <!-- TOP HEADER BANNER -->
          <div style="background:linear-gradient(90deg, #4338CA 0%, #6366F1 100%); padding:1.1rem 1.5rem; display:flex; align-items:center; gap:0.85rem; border-bottom:2px solid rgba(255,255,255,0.15);">
            <div style="width:44px; height:44px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:0.85rem; color:#4338CA; box-shadow:0 2px 8px rgba(0,0,0,0.2);">PAS</div>
            <div>
              <div style="font-size:0.7rem; font-weight:700; color:rgba(255,255,255,0.85); text-transform:uppercase; letter-spacing:1px;">POORNIMA ATTENDANCE SYSTEM</div>
              <div style="font-size:1.05rem; font-weight:800; color:white; letter-spacing:0.5px;">FACULTY DIGITAL ID CARD</div>
            </div>
          </div>

          <!-- CARD CONTENT BODY -->
          <div style="padding:1.5rem; display:grid; grid-template-columns:1fr 140px; gap:1.25rem; align-items:flex-start;">
            
            <!-- LEFT DETAILS -->
            <div style="font-size:0.85rem; display:flex; flex-direction:column; gap:0.45rem;">
              <div style="font-size:1.2rem; font-weight:800; color:#F8FAFC; margin-bottom:0.4rem; border-bottom:1px solid rgba(255,255,255,0.15); padding-bottom:0.4rem;">
                ${name}
              </div>

              <div style="display:flex; justify-content:space-between; gap:0.5rem;">
                <span style="color:rgba(255,255,255,0.6);">Faculty ID:</span>
                <strong style="color:#C7D2FE;">${facultyId}</strong>
              </div>

              <div style="display:flex; justify-content:space-between; gap:0.5rem;">
                <span style="color:rgba(255,255,255,0.6);">Employee No:</span>
                <strong style="color:#A5B4FC;">${empNo}</strong>
              </div>

              <div style="display:flex; justify-content:space-between; gap:0.5rem;">
                <span style="color:rgba(255,255,255,0.6);">Email:</span>
                <strong style="color:#E2E8F0; font-size:0.75rem; word-break:break-all;">${email}</strong>
              </div>

              <div style="display:flex; justify-content:space-between; gap:0.5rem;">
                <span style="color:rgba(255,255,255,0.6);">Department:</span>
                <strong style="color:#E2E8F0; text-align:right;">${department}</strong>
              </div>

              <div style="display:flex; justify-content:space-between; gap:0.5rem;">
                <span style="color:rgba(255,255,255,0.6);">Designation:</span>
                <strong style="color:#E2E8F0;">${designation}</strong>
              </div>

              <div style="display:flex; justify-content:space-between; gap:0.5rem;">
                <span style="color:rgba(255,255,255,0.6);">Access Level:</span>
                <strong style="color:#4ADE80;">FACULTY AUTHORIZED</strong>
              </div>
            </div>

            <!-- RIGHT COLUMN: PHOTO & QR -->
            <div style="display:flex; flex-direction:column; align-items:center; gap:0.85rem;">
              
              <!-- FACULTY PHOTO PLACEHOLDER -->
              <div style="width:105px; height:120px; background:linear-gradient(135deg, #475569, #334155); border-radius:10px; border:2px solid rgba(255,255,255,0.25); display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.3);">
                <div style="font-size:2.8rem; font-weight:800; color:rgba(255,255,255,0.85);">${name.charAt(0)}</div>
              </div>

              <!-- QR CODE BLOCK -->
              <div style="background:white; padding:6px; border-radius:8px; border:2px solid #6366F1; box-shadow:0 4px 12px rgba(0,0,0,0.2); text-align:center;">
                ${qrSvg}
                <div style="font-size:0.58rem; font-weight:800; color:#0F172A; margin-top:2px; letter-spacing:0.5px;">FACULTY QR</div>
              </div>

            </div>

          </div>

          <!-- BOTTOM FOOTER -->
          <div style="background:rgba(0,0,0,0.3); padding:0.6rem 1.5rem; border-top:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center; font-size:0.7rem; color:rgba(255,255,255,0.6);">
            <div>Status: <span style="color:#4ADE80; font-weight:700;">● VERIFIED ACTIVE</span></div>
            <div>Poornima Attendance System v2.0</div>
          </div>

        </div>

        <!-- BUTTON ACTIONS -->
        <div style="display:flex; gap:1rem; margin-top:1.5rem;">
          <button class="btn-primary" onclick="DigitalIdView.printCard()">
            <i data-lucide="printer"></i> Print ID Card
          </button>
          <button class="btn-secondary" onclick="DigitalIdView.downloadCard()">
            <i data-lucide="download"></i> Download Digital ID
          </button>
        </div>

      </div>
    `;
  },

  printCard() {
    const card = document.getElementById('digital-id-card');
    if (!card) return;
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>PAMS Digital ID Card</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          body { margin:0; padding:40px; font-family:'Inter', sans-serif; display:flex; justify-content:center; background:#F8FAFC; }
          .printable-area { width: 440px !important; margin: 0 auto; box-shadow: none !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        </style>
      </head>
      <body>
        ${card.outerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  },

  downloadCard() {
    UIService.showToast("Initiating Digital ID download. Select 'Save as PDF' in the print dialog for high resolution.", "info");
    this.printCard();
  }
};

window.DigitalIdView = DigitalIdView;

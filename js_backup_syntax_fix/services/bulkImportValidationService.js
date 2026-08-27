/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - BULK IMPORT VALIDATION SERVICE
   Handles complex business rules, existing data lookups, and duplicate 
   detection for Excel Bulk Imports.
   ========================================================================== */

const BulkImportValidationService = {
  
  /**
   * Validates parsed Excel rows for Students.
   * @param {Array<Object>} rows - Array of raw JSON objects from Excel
   * @returns {Array<Object>} - Augmented rows with __importStatus and __importError
   */
  validateStudents(rows) {
    if (!rows || rows.length === 0) return [];

    const existingDepts = departmentService.getDepartments().map(d => d.name.toLowerCase());
    
    // Using a map to track duplicates INSIDE the excel file itself
    const fileRollNos = new Set();
    const fileRegNos = new Set();
    const fileEmails = new Set();

    return rows.map((row, index) => {
      // Create a shallow copy so we can attach metadata without mutating original blindly
      const record = { ...row, __originalRowIndex: index + 2 }; // +2 assuming 1 header row

      // 1. Check Required Fields
      const required = ['Name', 'First Name', 'Roll No', 'Registration No', 'Department', 'Enrollment Year'];
      for (const req of required) {
        if (!record[req] || String(record[req]).trim() === '') {
          return this._mark(record, 'INVALID', `Required field missing: ${req}`);
        }
      }

      const rollNo = String(record['Roll No']).trim().toUpperCase();
      const regNo = String(record['Registration No']).trim().toUpperCase();
      const department = String(record['Department']).trim();
      const firstName = String(record['First Name']).trim();
      const enrollmentYear = String(record['Enrollment Year']).trim();

      // 2. Validate Department
      if (!existingDepts.includes(department.toLowerCase())) {
        return this._mark(record, 'INVALID', `Invalid Department: ${department}`);
      }

      // 3. Generate Email
      const email = studentService.generateOfficialEmail(firstName, enrollmentYear, department, regNo);
      if (!email) {
        return this._mark(record, 'INVALID', 'Could not generate official email. Check First Name, Dept, Reg No.');
      }
      record['Generated Email'] = email; // Show it in preview

      // 4. Intra-file Duplicate Detection (inside Excel itself)
      if (fileRollNos.has(rollNo)) return this._mark(record, 'DUPLICATE', 'Duplicate Roll No inside uploaded Excel file.');
      fileRollNos.add(rollNo);
      
      if (fileRegNos.has(regNo)) return this._mark(record, 'DUPLICATE', 'Duplicate Registration No inside uploaded Excel file.');
      fileRegNos.add(regNo);

      if (fileEmails.has(email)) return this._mark(record, 'DUPLICATE', 'Duplicate Email generated inside uploaded Excel file.');
      fileEmails.add(email);

      // 5. Database Duplicate Detection
      try {
        const mockData = MOCK_DATA.students;
        
        if (mockData.some(s => (s.rollNumber || s.rollNo || '').toLowerCase() === rollNo.toLowerCase())) {
          return this._mark(record, 'DUPLICATE', `Roll No ${rollNo} already exists in Database.`);
        }
        
        if (mockData.some(s => (s.registrationNumber || '').toLowerCase() === regNo.toLowerCase())) {
          return this._mark(record, 'DUPLICATE', `Registration No ${regNo} already exists in Database.`);
        }

        if (mockData.some(s => (s.email || '').toLowerCase() === email.toLowerCase())) {
          return this._mark(record, 'DUPLICATE', `Email ${email} already assigned to another student in Database.`);
        }
      } catch (err) {
        // Fallback if MOCK_DATA not accessible
      }

      // 6. Semester validation (1-8)
      if (record['Semester']) {
        const sem = parseInt(record['Semester']);
        if (isNaN(sem) || sem < 1 || sem > 8) {
          return this._mark(record, 'INVALID', 'Invalid Semester (must be 1-8)');
        }
      }

      // If all passed, it is valid
      return this._mark(record, 'VALID', '');
    });
  },

  /**
   * Validates parsed Excel rows for Faculty.
   */
  validateFaculty(rows) {
    if (!rows || rows.length === 0) return [];

    const existingDepts = departmentService.getDepartments().map(d => d.name.toLowerCase());
    
    const fileEmpIds = new Set();
    const fileEmails = new Set();

    return rows.map((row, index) => {
      const record = { ...row, __originalRowIndex: index + 2 };

      const required = ['Employee ID', 'Name', 'First Name', 'Last Name', 'Department'];
      for (const req of required) {
        if (!record[req] || String(record[req]).trim() === '') {
          return this._mark(record, 'INVALID', `Required field missing: ${req}`);
        }
      }

      const empId = String(record['Employee ID']).trim().toUpperCase();
      const department = String(record['Department']).trim();
      const firstName = String(record['First Name']).trim();
      const lastName = String(record['Last Name']).trim();

      if (!existingDepts.includes(department.toLowerCase())) {
        return this._mark(record, 'INVALID', `Invalid Department: ${department}`);
      }

      const email = facultyService.generateOfficialEmail(firstName, lastName);
      if (!email) {
        return this._mark(record, 'INVALID', 'Could not generate official email. Check Name format.');
      }
      record['Generated Email'] = email;

      // Intra-file Duplicate Detection
      if (fileEmpIds.has(empId)) return this._mark(record, 'DUPLICATE', 'Duplicate Employee ID inside uploaded Excel file.');
      fileEmpIds.add(empId);

      if (fileEmails.has(email)) return this._mark(record, 'DUPLICATE', 'Duplicate Generated Faculty Email inside uploaded Excel file (Same name conflict).');
      fileEmails.add(email);

      // Database Duplicate Detection
      if (facultyService.checkEmployeeIdCollision(empId)) {
        return this._mark(record, 'DUPLICATE', `Employee ID ${empId} already exists in Database.`);
      }

      if (facultyService.checkEmailCollision(email)) {
        return this._mark(record, 'DUPLICATE', `Email ${email} already exists in Database (Same name conflict).`);
      }

      return this._mark(record, 'VALID', '');
    });
  },

  /**
   * Helper to attach metadata properties cleanly
   */
  _mark(record, status, reason) {
    record.__importStatus = status;
    record.__importError = reason;
    return record;
  }
};

window.BulkImportValidationService = BulkImportValidationService;

/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - VALIDATION UTILITIES
   ========================================================================== */

const Validation = {
  isRequired(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
  },

  isValidEmail(email) {
    if (!this.isRequired(email)) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  },

  isValidRollNumber(rollNo) {
    if (!this.isRequired(rollNo)) return false;
    return rollNo.trim().length >= 3;
  },

  validateForm(formData, rules) {
    const errors = {};
    Object.keys(rules).forEach(field => {
      const value = formData[field];
      const fieldRules = rules[field];

      if (fieldRules.required && !this.isRequired(value)) {
        errors[field] = `${fieldRules.label || field} is required.`;
      } else if (fieldRules.email && !this.isValidEmail(value)) {
        errors[field] = `Please enter a valid email address.`;
      } else if (fieldRules.min && Number(value) < fieldRules.min) {
        errors[field] = `${fieldRules.label || field} must be at least ${fieldRules.min}.`;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

window.Validation = Validation;

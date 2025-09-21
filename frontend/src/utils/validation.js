
import { VALIDATION } from '../constants';

export const CHAR_PATTERNS = {
  PHONE: /[0-9\s\-\(\)\+]/,
  NAME: /[a-zA-Z\s\-']/,
  COUNTRY: /[a-zA-Z\s\-]/,
  COMPANY_NAME: /[a-zA-Z0-9\s\-&\.',\(\)]/,
  EMAIL: /[a-zA-Z0-9@\._\-\+]/,
  UPPERCASE: /[A-Z]/,
  LOWERCASE: /[a-z]/,
  DIGIT: /[0-9]/,
  SPECIAL_CHAR: /[!@#$%^&*(),.?":{}|<>]/
};

export const filterInput = {
  phone: (value) => value.split('').filter(char => CHAR_PATTERNS.PHONE.test(char)).join(''),
  name: (value) => value.split('').filter(char => CHAR_PATTERNS.NAME.test(char)).join(''),
  country: (value) => value.split('').filter(char => CHAR_PATTERNS.COUNTRY.test(char)).join(''),
  companyName: (value) => value.split('').filter(char => CHAR_PATTERNS.COMPANY_NAME.test(char)).join(''),
  email: (value) => value.split('').filter(char => CHAR_PATTERNS.EMAIL.test(char)).join('')
};

// Validates password strength with comprehensive security requirements
export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }

  if (!password.split('').some(char => CHAR_PATTERNS.UPPERCASE.test(char))) {
    errors.push('Password must contain at least one uppercase letter.');
  }

  if (!password.split('').some(char => CHAR_PATTERNS.LOWERCASE.test(char))) {
    errors.push('Password must contain at least one lowercase letter.');
  }

  if (!password.split('').some(char => CHAR_PATTERNS.DIGIT.test(char))) {
    errors.push('Password must contain at least one digit.');
  }

  if (!password.split('').some(char => CHAR_PATTERNS.SPECIAL_CHAR.test(char))) {
    errors.push('Password must contain at least one special character.');
  }

  return errors;
};




export const validateLength = {
  label: (value) => {
    if (!value || value.trim().length === 0) {
      return 'Label is required.';
    }
    if (value.length > VALIDATION.MAX_LABEL_LENGTH) {
      return `Label must be ${VALIDATION.MAX_LABEL_LENGTH} characters or less.`;
    }
    return null;
  },

  name: (value) => {
    if (!value || value.trim().length === 0) {
      return 'Name is required.';
    }
    if (value.length > VALIDATION.MAX_NAME_LENGTH) {
      return `Name must be ${VALIDATION.MAX_NAME_LENGTH} characters or less.`;
    }
    return null;
  },

  companyName: (value) => {
    if (value && value.length > VALIDATION.MAX_COMPANY_NAME_LENGTH) {
      return `Company name must be ${VALIDATION.MAX_COMPANY_NAME_LENGTH} characters or less.`;
    }
    return null;
  },

  bio: (value) => {
    if (value && value.length > VALIDATION.MAX_BIO_LENGTH) {
      return `Bio must be ${VALIDATION.MAX_BIO_LENGTH} characters or less.`;
    }
    return null;
  },

  phone: (value) => {
    if (value && value.length > VALIDATION.MAX_PHONE_LENGTH) {
      return `Phone number must be ${VALIDATION.MAX_PHONE_LENGTH} characters or less.`;
    }
    return null;
  }
};




// Validates email format using standard regex pattern
export const validateEmail = (email) => {
  if (!email || email.trim().length === 0) {
    return 'Email is required.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address.';
  }

  return null;
};




// Generic required field validator with custom field name
export const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim().length === 0) {
    return `${fieldName} is required.`;
  }
  return null;
};




export const validateDate = {
  dateOfBirth: (date) => {
    if (!date) return null;

    const today = new Date();
    const birthDate = new Date(date);

    if (birthDate > today) {
      return 'Date of birth cannot be in the future.';
    }

    const age = today.getFullYear() - birthDate.getFullYear();
    if (age > 150) {
      return 'Please enter a valid date of birth.';
    }

    return null;
  },

  companyFounded: (year) => {
    if (!year) return null;

    const currentYear = new Date().getFullYear();
    if (year < 1800 || year > currentYear) {
      return `Company founded year must be between 1800 and ${currentYear}.`;
    }

    return null;
  }
};




export const validateFile = {
  profilePicture: (file) => {
    if (!file) return null;

    const { MAX_PROFILE_PICTURE_SIZE, ACCEPTED_IMAGE_TYPES } = require('../constants').FILE_UPLOAD;

    if (file.size > MAX_PROFILE_PICTURE_SIZE) {
      return `File size must be less than ${MAX_PROFILE_PICTURE_SIZE / (1024 * 1024)}MB.`;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, or GIF).';
    }

    return null;
  }
};




export const validateForm = {
  


  validateFields: (fields, validationRules) => {
    const errors = {};

    Object.entries(fields).forEach(([fieldName, value]) => {
      if (validationRules[fieldName]) {
        const error = validationRules[fieldName](value);
        if (error) {
          errors[fieldName] = error;
        }
      }
    });

    return Object.keys(errors).length > 0 ? errors : null;
  },

  


  hasErrors: (errors) => {
    return errors && Object.keys(errors).some(key => errors[key]);
  },

  


  getFirstError: (errors) => {
    if (!errors) return null;

    const firstErrorKey = Object.keys(errors).find(key => errors[key]);
    return firstErrorKey ? errors[firstErrorKey] : null;
  }
};





// Creates input change handlers with optional filtering and validation
export const createInputHandler = (setter, filterType = null, validator = null) => {
  return (e) => {
    let value = e.target.value;


    if (filterType && filterInput[filterType]) {
      value = filterInput[filterType](value);
    }


    setter(value);


    if (validator) {
      const error = validator(value);
      return error;
    }

    return null;
  };
};




export const VALIDATION_RULES = {
  personalDetails: {
    first_name: (value) => validateRequired(value, 'First name') || validateLength.name(value),
    last_name: (value) => validateRequired(value, 'Last name') || validateLength.name(value),
    phone: (value) => validateLength.phone(value),
    country: (value) => null,
    date_of_birth: (value) => validateDate.dateOfBirth(value),
    bio: (value) => validateLength.bio(value)
  },

  companyDetails: {
    company_name: (value) => validateLength.companyName(value),
    company_phone: (value) => validateLength.phone(value),
    company_country: (value) => null,
    company_founded: (value) => validateDate.companyFounded(value),
    company_description: (value) => validateLength.bio(value)
  },

  context: {
    label: (value) => validateLength.label(value),
    given: (value) => validateRequired(value, 'Given name') || validateLength.name(value),
    family: (value) => validateLength.name(value)
  },

  auth: {
    email: (value) => validateEmail(value),
    password: (value) => {
      const errors = validatePassword(value);
      return errors.length > 0 ? errors[0] : null;
    }
  }
};
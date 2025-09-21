import { useState, useCallback } from 'react';
import { filterInput, validateForm, createInputHandler } from '../utils/validation';





export const useFormHandler = (initialState = {}, validationRules = {}) => {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  


  // Creates input change handler with filtering and validation
  const handleInputChange = useCallback((field, filterType = null, validator = null) => (e) => {
    let value = e.target.value;


    if (filterType && filterInput[filterType]) {
      value = filterInput[filterType](value);
    }

    setFormData((prev) => ({ ...prev, [field]: value }));


    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }


    if (validator) {
      const error = validator(value);
      if (error) {
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    }
  }, [errors]);

  


  // Creates a phone number input handler with automatic formatting
  const createPhoneHandler = useCallback((field) =>
    handleInputChange(field, 'phone', validationRules[field]), [handleInputChange, validationRules]
  );

  // Creates a name input handler that filters out invalid characters
  const createNameHandler = useCallback((field) =>
    handleInputChange(field, 'name', validationRules[field]), [handleInputChange, validationRules]
  );

  // Creates a country input handler that only allows letters and basic punctuation
  const createCountryHandler = useCallback((field) =>
    handleInputChange(field, 'country', validationRules[field]), [handleInputChange, validationRules]
  );

  // Creates a company name input handler with business-appropriate character filtering
  const createCompanyNameHandler = useCallback((field) =>
    handleInputChange(field, 'companyName', validationRules[field]), [handleInputChange, validationRules]
  );

  


  // Handles date picker changes and clears field errors
  const handleDateChange = useCallback((field) => (newValue) => {
    setFormData((prev) => ({ ...prev, [field]: newValue }));


    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  


  // Handles file input changes for uploads
  const handleFileChange = useCallback((field) => (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, [field]: file }));


    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  


  // Validates all form fields according to defined rules
  const validateAllFields = useCallback(() => {
    const formErrors = validateForm.validateFields(formData, validationRules);
    setErrors(formErrors || {});
    return !formErrors;
  }, [formData, validationRules]);

  


  // Handles form submission with validation and error processing
  const handleSubmit = useCallback(async (submitFn, onSuccess = null, onError = null) => {
    setLoading(true);


    const isValid = validateAllFields();
    if (!isValid) {
      setLoading(false);
      return false;
    }

    try {
      const result = await submitFn(formData);
      if (onSuccess) {
        onSuccess(result);
      }
      return result;
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData && typeof errorData === 'object') {

        const formErrors = {};
        Object.keys(errorData).forEach(key => {
          if (Array.isArray(errorData[key])) {
            formErrors[key] = errorData[key][0];
          } else {
            formErrors[key] = errorData[key];
          }
        });
        setErrors(formErrors);
      }

      if (onError) {
        onError(err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [formData, validateAllFields]);

  


  // Resets form to initial state and clears all errors
  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setLoading(false);
  }, [initialState]);

  


  // Updates form data without triggering validation
  const updateFormData = useCallback((newData) => {
    setFormData(newData);
  }, []);

  


  // Checks if form data has been modified from original state
  const isModified = useCallback((originalData) => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  }, [formData]);

  return {
    formData,
    loading,
    errors,
    handleInputChange,
    createPhoneHandler,
    createNameHandler,
    createCountryHandler,
    createCompanyNameHandler,
    handleDateChange,
    handleFileChange,
    handleSubmit,
    validateAllFields,
    resetForm,
    updateFormData,
    isModified,
    setFormData,
    setLoading,
    setErrors
  };
};
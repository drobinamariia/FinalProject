









export const getErrorMessage = (error, defaultMessage = "An error occurred") => {
  return error.response?.data?.detail ||
    error.response?.data?.message ||
    error.message ||
    defaultMessage;
};







export const formatDate = (date, includeTime = false) => {
  if (!date) return "N/A";
  
  try {
    const dateObj = new Date(date);
    return includeTime 
      ? dateObj.toLocaleString() 
      : dateObj.toLocaleDateString();
  } catch {
    return "Invalid Date";
  }
};






export const validateRequiredFields = (fields) => {
  const emptyFields = Object.entries(fields)
    .filter(([_, value]) => !value || !value.toString().trim())
    .map(([key]) => key);

  if (emptyFields.length > 0) {
    return `Please fill in all required fields: ${emptyFields.join(", ")}`;
  }

  return null;
};






export const downloadJson = (data, filename) => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};







export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
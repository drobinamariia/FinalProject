
export const VALIDATION = {
  MAX_LABEL_LENGTH: 40,
  MAX_NAME_LENGTH: 50,
  MAX_BIO_LENGTH: 500,
  MAX_DESCRIPTION_LENGTH: 1000,
  MIN_SEARCH_LENGTH: 1,
  MAX_PHONE_LENGTH: 20,
  MAX_COMPANY_NAME_LENGTH: 200,
  MAX_INDUSTRY_LENGTH: 100,
  MAX_COMPANY_SIZE_LENGTH: 50
};


export const CONTEXT_VISIBILITY = {
  PUBLIC: 'public',
  CODE: 'code',
  CONSENT: 'consent'
};


export const USER_ROLES = {
  INDIVIDUAL: 'individual',
  COMPANY: 'company'
};


export const NOTIFICATION_TYPES = {
  REDEMPTION: 'redemption',
  CONSENT_REQUEST: 'consent_request',
  CONSENT_APPROVED: 'consent_approved',
  CONSENT_DENIED: 'consent_denied',
  ACCESS_REVOKED: 'access_revoked',
  CONTEXT_EXPIRED: 'context_expired'
};


export const STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DENIED: 'denied',
  ACTIVE: 'active',
  EXPIRED: 'expired',
  REVOKED: 'revoked'
};


export const API_ENDPOINTS = {
  CONTEXTS: 'contexts/',
  ARCHIVED_CONTEXTS: 'contexts/archived/',
  SHARE_CODES: 'sharecodes/',
  REDEMPTIONS: 'redemptions/',
  COMPANY_REDEMPTIONS: 'company-redemptions/',
  CONSENT_REQUESTS: 'consent-requests/',
  NOTIFICATIONS: 'notifications/',
  PROFILE: 'profile/',
  PERSONAL_DETAILS: 'personal-details/',
  COMPANY_DETAILS: 'company-details/',
  EXPIRED_CONTEXTS_CHECK: 'check-expired-contexts/'
};


export const UI = {
  DEFAULT_PAGE_SIZE: 20,
  DEBOUNCE_DELAY: 300,
  NOTIFICATION_AUTO_HIDE_DURATION: 5000,
  MAX_NOTIFICATION_DISPLAY: 10,
  QR_CODE_SIZE: 256,
  QR_CODE_MARGIN: 2
};


export const FILE_UPLOAD = {
  MAX_PROFILE_PICTURE_SIZE: 5 * 1024 * 1024,
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  PROFILE_PICTURE_DIMENSIONS: {
    WIDTH: 80,
    HEIGHT: 80
  }
};
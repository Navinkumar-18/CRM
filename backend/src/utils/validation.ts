const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRequiredEmail = (email: unknown): string | null => {
  if (typeof email !== 'string' || email.trim().length === 0) {
    return 'Email is required';
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Please provide a valid email address';
  }

  return null;
};

export const validateOptionalEmail = (email: unknown): string | null => {
  if (email === undefined || email === null || email === '') {
    return null;
  }

  if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return 'Please provide a valid email address';
  }

  return null;
};

export const validatePassword = (password: unknown): string | null => {
  if (typeof password !== 'string' || password.length < 6) {
    return 'Password must be at least 6 characters';
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least 1 special character';
  }

  return null;
};

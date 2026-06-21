/**
 * Validate password strength based on strict complexity guidelines.
 * Requirements: Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character.
 * Exclusions: Rejects password if it contains PUP ID, email local prefix, or parts of the full name.
 * @param {string} password
 * @param {{ email?: string, fullName?: string, pupId?: string }} options
 * @returns {string|null} Error message if invalid, or null if valid.
 */
export function validatePasswordStrength(password, { email = '', fullName = '', pupId = '' } = {}) {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/\d/.test(password)) {
    return 'Password must contain at least one digit';
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return 'Password must contain at least one special character';
  }

  const lowerPassword = password.toLowerCase();

  if (pupId) {
    const lowerPupId = pupId.toLowerCase();
    if (lowerPassword.includes(lowerPupId)) {
      return 'Password cannot contain your PUP ID';
    }
  }

  if (email) {
    const emailPrefix = email.split('@')[0].toLowerCase();
    if (emailPrefix.length >= 3 && lowerPassword.includes(emailPrefix)) {
      return 'Password cannot contain your email username';
    }
  }

  if (fullName) {
    const lowerFullName = fullName.toLowerCase();
    if (lowerPassword.includes(lowerFullName)) {
      return 'Password cannot contain your full name';
    }
    // Check parts of full name (e.g. John, Doe)
    const nameParts = lowerFullName.split(/[\s.\-]+/).filter(part => part.length >= 3);
    for (const part of nameParts) {
      if (lowerPassword.includes(part)) {
        return `Password cannot contain parts of your name ("${part}")`;
      }
    }
  }

  return null;
}

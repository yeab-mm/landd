/**
 * Centralized validation logic for the Land Portal App
 */

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.toLowerCase());
};

export const validatePhone = (phone: string): boolean => {
  // Ethiopian format: +251 9XX XXX XXX or 09XXXXXXXX
  const re = /^(\+251|0)?[79]\d{8}$/;
  return re.test(phone.replace(/\s/g, ''));
};

export const validateFaydaId = (faydaId: string): boolean => {
  // Format: 1234 5678 9012 3456
  const re = /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/;
  return re.test(faydaId);
};

export const formatFaydaId = (input: string): string => {
  const digits = input.replace(/\D/g, '');
  const limited = digits.slice(0, 16);
  const parts = [];
  for (let i = 0; i < limited.length; i += 4) {
    parts.push(limited.slice(i, i + 4));
  }
  return parts.join(' ');
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export interface PasswordStrength {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

export const getPasswordStrength = (password: string): PasswordStrength => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
};

export const getPasswordStrengthScore = (strength: PasswordStrength): number => {
  return Object.values(strength).filter(Boolean).length;
};

export const getPasswordStrengthColor = (score: number): string => {
  if (score <= 2) return '#EF4444'; // Weak
  if (score <= 4) return '#F59E0B'; // Medium
  return '#125f43'; // Strong
};

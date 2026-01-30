export const formatPhoneNumber = (value: string): string => {
  if (!value) return '';
  
  // Remove all non-digit characters
  const digitsOnly = value.replace(/\D/g, '');
  
  // Apply mask (XX) 9XXXX-XXXX
  let maskedValue = '';
  if (digitsOnly.length > 0) {
    maskedValue = `(${digitsOnly.substring(0, 2)}`;
  }
  if (digitsOnly.length > 2) {
    maskedValue = `(${digitsOnly.substring(0, 2)}) ${digitsOnly.substring(2, 7)}`;
  }
  if (digitsOnly.length > 7) {
    maskedValue = `(${digitsOnly.substring(0, 2)}) ${digitsOnly.substring(2, 7)}-${digitsOnly.substring(7, 11)}`;
  }

  return maskedValue;
};

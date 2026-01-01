/**
 * Masks a phone number by keeping the first 3 digits and last 4 digits visible,
 * replacing the middle with "***".
 * 
 * Examples:
 * - "0987651234" -> "098***1234"
 * - "123456" -> "12***6"
 * - null/undefined -> null
 * 
 * @param phoneNumber - The full phone number to mask
 * @returns The masked phone number, or null if input is null/undefined
 */
export function maskPhoneNumber(phoneNumber: string | null | undefined): string | null {
  if (!phoneNumber) {
    return null;
  }

  const digits = phoneNumber.replace(/\D/g, ""); // Remove non-digits
  
  if (digits.length < 7) {
    // For short numbers, mask the middle part
    if (digits.length <= 3) {
      return digits; // Too short to mask meaningfully
    }
    const firstPart = digits.slice(0, 2);
    const lastPart = digits.slice(-1);
    return `${firstPart}***${lastPart}`;
  }

  // Standard masking: first 3 + *** + last 4
  const firstPart = digits.slice(0, 3);
  const lastPart = digits.slice(-4);
  return `${firstPart}***${lastPart}`;
}
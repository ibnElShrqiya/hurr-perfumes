const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
const persianDigits = '۰۱۲۳۴۵۶۷۸۹';

/** Normalize common Egyptian mobile formats to 11 ASCII digits. */
export function normalizeEgyptianMobile(value: string): string {
  let digits = value
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/[^\d+]/g, '');

  if (digits.startsWith('+20')) digits = `0${digits.slice(3)}`;
  else if (digits.startsWith('0020')) digits = `0${digits.slice(4)}`;
  return digits;
}

export function isEgyptianMobile(value: string): boolean {
  return /^(010|011|012|015)\d{8}$/.test(normalizeEgyptianMobile(value));
}

/**
 * Format a date value into a localized string.
 * @param date - Date, timestamp, or ISO string
 * @param locale - BCP 47 locale tag (default: 'en-US')
 * @param options - Intl.DateTimeFormatOptions
 */
export function formatDate(
  date: Date | string | number,
  locale = 'en-US',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';
  return new Intl.DateTimeFormat(locale, options).format(d);
}

/**
 * Format a number as currency.
 * @param amount - Numeric amount
 * @param currency - ISO 4217 currency code (default: 'USD')
 * @param locale - BCP 47 locale tag (default: 'en-US')
 */
export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number with locale-aware separators.
 * @param value - Number to format
 * @param locale - BCP 47 locale tag (default: 'en-US')
 * @param options - Intl.NumberFormatOptions
 */
export function formatNumber(
  value: number,
  locale = 'en-US',
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Truncate a string to a maximum length, appending an ellipsis when truncated.
 * @param text - String to truncate
 * @param maxLength - Maximum character length (default: 100)
 * @param suffix - String to append when truncated (default: '...')
 */
export function truncate(text: string, maxLength = 100, suffix = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length).trimEnd() + suffix;
}

/**
 * Convert a string to title case.
 * @param text - String to convert
 */
export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Convert bytes to a human-readable file size string.
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Generate a short, unique receipt ID
 * Format: 8 characters using alphanumeric (0-9, A-Z)
 * This gives us 36^8 = 2,821,109,907,456 unique combinations
 */

export function generateReceiptId(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Generate a receipt ID with a prefix (optional)
 * @param prefix - Optional prefix (e.g., 'R' for Receipt, 'O' for Order)
 */
export function generateReceiptIdWithPrefix(prefix?: string): string {
  const id = generateReceiptId();
  return prefix ? `${prefix}${id}` : id;
}

/**
 * Format a receipt ID for display
 * @param id - The receipt ID to format
 * @param prefix - Optional prefix to add
 */
export function formatReceiptId(id: string, prefix?: string): string {
  if (prefix) {
    return `${prefix}${id}`;
  }
  return id;
}

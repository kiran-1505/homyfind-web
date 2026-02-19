/**
 * Safely parse JSON, returning null on failure.
 * Prevents crashes from corrupted localStorage or invalid JSON.
 */
export function safeParseJSON<T>(json: string | null): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/**
 * Safely set an item in localStorage, ignoring quota errors.
 */
export function safeSetLocalStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage full or unavailable
  }
}

/**
 * Format a number as Indian Rupees.
 */
export function formatINR(amount: number): string {
  return amount.toLocaleString('en-IN');
}

/**
 * Request persistent storage from the browser.
 * Returns true if persistence was granted, false otherwise.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (
    typeof navigator !== 'undefined' &&
    navigator.storage &&
    typeof navigator.storage.persist === 'function'
  ) {
    return navigator.storage.persist();
  }
  return false;
}

/**
 * Get storage usage estimate.
 * Returns used/total in megabytes, or null if API is unavailable.
 */
export async function getStorageEstimate(): Promise<{
  usedMB: number;
  totalMB: number;
} | null> {
  if (
    typeof navigator !== 'undefined' &&
    navigator.storage &&
    typeof navigator.storage.estimate === 'function'
  ) {
    const estimate = await navigator.storage.estimate();
    return {
      usedMB: (estimate.usage ?? 0) / (1024 * 1024),
      totalMB: (estimate.quota ?? 0) / (1024 * 1024),
    };
  }
  return null;
}

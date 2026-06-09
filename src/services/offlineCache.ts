export async function registerServiceWorker(scriptUrl = '/sw.js') {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    await navigator.serviceWorker.register(scriptUrl);
    return true;
  } catch {
    return false;
  }
}

export function isOfflineStartup() {
  return !navigator.onLine;
}

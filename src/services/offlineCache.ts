const SW_UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000;

type RegisterSW = (swScriptUrl: string) => Promise<ServiceWorkerRegistration>;

export async function registerServiceWorker(registerSWImpl?: RegisterSW) {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  if (!registerSWImpl && !import.meta.env.PROD) {
    return false;
  }

  try {
    const registerSW = registerSWImpl ?? ((swScriptUrl: string) => navigator.serviceWorker.register(swScriptUrl));
    const registration = await registerSW('/sw.js');

    if (registration.waiting) {
      window.location.reload();
    }

    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;
      if (!installingWorker) {
        return;
      }

      installingWorker.addEventListener('statechange', () => {
        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
          window.location.reload();
        }
      });
    });

    void registration.update();

    window.setInterval(() => {
      void registration.update();
    }, SW_UPDATE_CHECK_INTERVAL_MS);

    return true;
  } catch {
    return false;
  }
}

export function isOfflineStartup() {
  return !navigator.onLine;
}

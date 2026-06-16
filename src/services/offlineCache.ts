const SW_UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000;

type RegisterSW = (options: {
  immediate?: boolean;
  onNeedRefresh?: () => void;
  onRegisteredSW?: (swScriptUrl: string, registration: ServiceWorkerRegistration | undefined) => void;
}) => (reloadPage?: boolean) => Promise<void>;

async function loadRegisterSW(): Promise<RegisterSW> {
  const moduleId = 'virtual:pwa-register';
  const module = await import(/* @vite-ignore */ moduleId);
  return module.registerSW;
}

export async function registerServiceWorker(registerSWImpl?: RegisterSW) {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registerSW = registerSWImpl ?? (await loadRegisterSW());
    let updateServiceWorker: (reloadPage?: boolean) => Promise<void> = async () => undefined;

    updateServiceWorker = registerSW({
      immediate: true,
      onNeedRefresh: () => {
        void updateServiceWorker(true);
      },
      onRegisteredSW: (_swScriptUrl, registration) => {
        if (!registration) {
          return;
        }

        void registration.update();

        window.setInterval(() => {
          void registration.update();
        }, SW_UPDATE_CHECK_INTERVAL_MS);
      },
    });

    return true;
  } catch {
    return false;
  }
}

export function isOfflineStartup() {
  return !navigator.onLine;
}

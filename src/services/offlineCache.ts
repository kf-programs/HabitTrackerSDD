const SW_UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000;

let swReloadTriggered = false;

function requestSkipWaiting(worker: ServiceWorker | null) {
  if (!worker) {
    return;
  }

  worker.postMessage({ type: 'SKIP_WAITING' });
}

function enableHotUpdateFlow(registration: ServiceWorkerRegistration) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (swReloadTriggered) {
      return;
    }

    swReloadTriggered = true;
    window.location.reload();
  });

  requestSkipWaiting(registration.waiting);

  registration.addEventListener('updatefound', () => {
    const installing = registration.installing;
    if (!installing) {
      return;
    }

    installing.addEventListener('statechange', () => {
      if (installing.state === 'installed' && navigator.serviceWorker.controller) {
        requestSkipWaiting(installing);
      }
    });
  });

  window.setInterval(() => {
    void registration.update();
  }, SW_UPDATE_CHECK_INTERVAL_MS);
}

export async function registerServiceWorker(scriptUrl = '/sw.js') {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register(scriptUrl);
    void registration.update();
    enableHotUpdateFlow(registration);
    return true;
  } catch {
    return false;
  }
}

export function isOfflineStartup() {
  return !navigator.onLine;
}

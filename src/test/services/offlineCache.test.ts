import { describe, expect, it, vi } from 'vitest';
import { isOfflineStartup, registerServiceWorker } from '../../services/offlineCache';

describe('offlineCache service', () => {
  it('registers service worker when available', async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    const registerSWMock = vi.fn();

    registerSWMock.mockImplementation((options: { onRegisteredSW?: (swScriptUrl: string, registration: ServiceWorkerRegistration) => void }) => {
      options.onRegisteredSW?.('/sw.js', { update } as unknown as ServiceWorkerRegistration);
      return vi.fn().mockResolvedValue(undefined);
    });

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {},
      configurable: true,
    });

    vi.spyOn(window, 'setInterval').mockReturnValue(1 as unknown as ReturnType<typeof setInterval>);

    const result = await registerServiceWorker(registerSWMock);

    expect(result).toBe(true);
    expect(registerSWMock).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('returns false when registration fails', async () => {
    const registerSWMock = vi.fn();

    registerSWMock.mockImplementation(() => {
      throw new Error('failed');
    });

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {},
      configurable: true,
    });

    const result = await registerServiceWorker(registerSWMock);

    expect(result).toBe(false);
  });

  it('reports offline startup when navigator is offline', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

    expect(isOfflineStartup()).toBe(true);
  });
});

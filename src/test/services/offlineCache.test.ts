import { describe, expect, it, vi } from 'vitest';
import { isOfflineStartup, registerServiceWorker } from '../../services/offlineCache';

describe('offlineCache service', () => {
  it('skips default registration outside production builds', async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    const addEventListener = vi.fn();
    const register = vi.fn().mockResolvedValue({
      update,
      addEventListener,
      waiting: undefined,
      installing: undefined,
    } as unknown as ServiceWorkerRegistration);

    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register },
      configurable: true,
    });

    vi.spyOn(window, 'setInterval').mockReturnValue(1 as unknown as ReturnType<typeof setInterval>);

    const result = await registerServiceWorker();

    expect(result).toBe(false);
    expect(register).not.toHaveBeenCalled();
  });

  it('registers service worker when available', async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    const registerSWMock = vi.fn();

    registerSWMock.mockResolvedValue({
      update,
      addEventListener: vi.fn(),
      waiting: undefined,
      installing: undefined,
    } as unknown as ServiceWorkerRegistration);

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {},
      configurable: true,
    });

    vi.spyOn(window, 'setInterval').mockReturnValue(1 as unknown as ReturnType<typeof setInterval>);

    const result = await registerServiceWorker(registerSWMock);

    expect(result).toBe(true);
    expect(registerSWMock).toHaveBeenCalledTimes(1);
    expect(registerSWMock).toHaveBeenCalledWith('/sw.js');
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

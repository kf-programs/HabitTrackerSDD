import { describe, expect, it, vi } from 'vitest';
import { isOfflineStartup, registerServiceWorker } from '../../services/offlineCache';

describe('offlineCache service', () => {
  it('registers service worker when available', async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    const register = vi.fn().mockResolvedValue({
      update,
      waiting: null,
      addEventListener: vi.fn(),
      installing: null,
    });
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register,
        addEventListener: vi.fn(),
        controller: null,
      },
      configurable: true,
    });

    const result = await registerServiceWorker('/sw.js');

    expect(result).toBe(true);
    expect(register).toHaveBeenCalledWith('/sw.js');
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('returns false when registration fails', async () => {
    const register = vi.fn().mockRejectedValue(new Error('failed'));
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register },
      configurable: true,
    });

    const result = await registerServiceWorker('/sw.js');

    expect(result).toBe(false);
  });

  it('reports offline startup when navigator is offline', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

    expect(isOfflineStartup()).toBe(true);
  });
});

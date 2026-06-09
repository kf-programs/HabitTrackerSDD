import { describe, expect, it, vi } from 'vitest';
import { isOfflineStartup, registerServiceWorker } from '../../services/offlineCache';

describe('offlineCache service', () => {
  it('registers service worker when available', async () => {
    const register = vi.fn().mockResolvedValue({});
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register },
      configurable: true,
    });

    const result = await registerServiceWorker('/sw.js');

    expect(result).toBe(true);
    expect(register).toHaveBeenCalledWith('/sw.js');
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

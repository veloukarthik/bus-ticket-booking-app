import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ServiceWorkerRegister from '../app/components/ServiceWorkerRegister';

describe('ServiceWorkerRegister', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('registers service worker when page is already loaded', async () => {
    const register = vi.fn().mockResolvedValue({ scope: '/sw.js' });
    Object.defineProperty(document, 'readyState', { configurable: true, value: 'complete' });
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register },
    });

    render(<ServiceWorkerRegister />);

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith('/sw.js');
    });
  });

  it('adds and removes load listener when page is not yet complete', () => {
    const register = vi.fn().mockResolvedValue({ scope: '/sw.js' });
    Object.defineProperty(document, 'readyState', { configurable: true, value: 'loading' });
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register },
    });

    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(<ServiceWorkerRegister />);
    expect(addSpy).toHaveBeenCalledWith('load', expect.any(Function));

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('load', expect.any(Function));
  });
});

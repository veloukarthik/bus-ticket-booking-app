import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BannerSearch from '../app/components/BannerSearch';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

describe('BannerSearch component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        json: async () => ({
          sources: ['Chennai', 'Bangalore'],
          destinations: ['Hyderabad', 'Bangalore'],
        }),
      })) as any,
    );
  });

  it('loads location options', async () => {
    render(<BannerSearch />);

    expect(await screen.findByLabelText(/From city/i)).toBeInTheDocument();
    expect(screen.getByText('Chennai')).toBeInTheDocument();
    expect(screen.getByLabelText(/To city/i)).toBeInTheDocument();
  });

  it('blocks same source and destination', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ sources: [], destinations: [] }),
    });
    render(<BannerSearch />);

    const from = await screen.findByLabelText(/From city/i);
    const to = screen.getByLabelText(/To city/i);

    fireEvent.change(from, { target: { value: 'Bangalore' } });
    fireEvent.change(to, { target: { value: 'Bangalore' } });
    fireEvent.submit(screen.getByRole('search', { name: /search rides/i }));

    expect(await screen.findByText(/cannot be the same/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it('navigates with query params on valid search', async () => {
    render(<BannerSearch />);

    const from = await screen.findByLabelText(/From city/i);
    const to = screen.getByLabelText(/To city/i);

    fireEvent.change(from, { target: { value: 'Chennai' } });
    fireEvent.change(to, { target: { value: 'Hyderabad' } });
    fireEvent.click(screen.getByRole('button', { name: /Search rides/i }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledTimes(1);
      const arg = String(push.mock.calls[0][0]);
      expect(arg).toContain('/search?');
      expect(arg).toContain('source=Chennai');
      expect(arg).toContain('destination=Hyderabad');
    });
  });
});

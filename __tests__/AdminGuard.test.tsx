import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminGuard from '../app/components/AdminGuard';

const replace = vi.fn();
let mockedUser: any = null;

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

vi.mock('../app/providers/UserProvider', () => ({
  useUser: () => ({ user: mockedUser }),
}));

describe('AdminGuard component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUser = null;
  });

  it('redirects guest users to login', async () => {
    render(
      <AdminGuard>
        <div>admin-content</div>
      </AdminGuard>,
    );

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/login');
    });
    expect(screen.queryByText('admin-content')).not.toBeInTheDocument();
  });

  it('redirects non-admin users to home', async () => {
    mockedUser = { id: 1, isAdmin: false };

    render(
      <AdminGuard>
        <div>admin-content</div>
      </AdminGuard>,
    );

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/');
    });
    expect(screen.queryByText('admin-content')).not.toBeInTheDocument();
  });

  it('renders children for admin user', () => {
    mockedUser = { id: 1, isAdmin: true };

    render(
      <AdminGuard>
        <div>admin-content</div>
      </AdminGuard>,
    );

    expect(screen.getByText('admin-content')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});

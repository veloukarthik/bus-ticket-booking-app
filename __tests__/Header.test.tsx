import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from '../app/components/Header';
import { vi } from 'vitest';

// Mock the user provider to control auth state
vi.mock('../app/providers/UserProvider', () => ({
  useUser: () => ({ user: null, logout: () => {} })
}));

// Mock AuthModal to avoid rendering modal internals during header tests
vi.mock('../app/components/AuthModal', () => ({
  default: (props: any) => React.createElement('div', { 'data-testid': 'auth-modal' })
}));

describe('Header component', () => {
  it('renders nav items including About and Log in when unauthenticated', () => {
    render(<Header />);
    expect(screen.getByText(/About/i)).toBeInTheDocument();
    expect(screen.getByText(/Log in/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign up/i)).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Footer from '../app/components/Footer';

describe('Footer component', () => {
  it('renders branding and legal links', () => {
    render(<Footer />);

    expect(screen.getByText(/Car booking marketplace for owners and passengers/i)).toBeInTheDocument();
    expect(screen.getByText(/Privacy/i)).toBeInTheDocument();
    expect(screen.getByText(/Terms/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/twitter/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/facebook/i)).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Services from '../app/components/Services';

describe('Services component', () => {
  it('renders all service cards', () => {
    render(<Services />);

    expect(screen.getByText(/What we offer/i)).toBeInTheDocument();
    expect(screen.getByText(/Online Booking/i)).toBeInTheDocument();
    expect(screen.getByText(/Fleet Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Analytics/i)).toBeInTheDocument();
  });
});

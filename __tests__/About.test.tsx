import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import About from '../app/components/About';

describe('About component', () => {
  it('renders the About heading and contact info', () => {
    render(<About />);
    expect(screen.getByText(/About LetsGo/i)).toBeInTheDocument();
    expect(screen.getByText(/Have questions or need assistance\?/i)).toBeInTheDocument();
  });
});

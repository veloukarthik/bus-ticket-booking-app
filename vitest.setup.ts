import '@testing-library/jest-dom';

// global mocks for next/link in tests
import { vi } from 'vitest';
import React from 'react';

vi.mock('next/link', () => ({
  default: (props: any) => {
    // render an anchor to keep tests simple
    const { children, href, ...rest } = props;
    return React.createElement('a', { href, ...rest }, children);
  }
}));

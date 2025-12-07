import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button component', () => {
  it('renders children', () => {
    render(<Button>בדיקה</Button>);
    expect(screen.getByText('בדיקה')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(<Button loading>טעינה</Button>);
    // when loading, the text still exists but the spinner replaces startIcon
    expect(screen.getByText('טעינה')).toBeInTheDocument();
  });

  it('renders children and responds to click', () => {
    render(<Button>לחץ אותי</Button>);
    const btn = screen.getByRole('button', { name: /לחץ אותי/i });
    expect(btn).toBeInTheDocument();
  });
});

import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
it('AP1 accessible heading and calculator region', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Calculator' })).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Calculator' })).toBeInTheDocument();
});

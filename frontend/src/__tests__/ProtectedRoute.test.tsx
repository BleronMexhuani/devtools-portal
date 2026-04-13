import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';

const mockAuth = {
  token: null as string | null,
  email: null as string | null,
  setAuth: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: false,
};

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    mockAuth.isAuthenticated = true;
    mockAuth.token = 'valid';
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects when not authenticated', () => {
    mockAuth.isAuthenticated = false;
    mockAuth.token = null;
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

// Mock the auth context
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

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>,
  );
}

describe('Navbar', () => {
  it('shows "Admin" link when not authenticated', () => {
    mockAuth.isAuthenticated = false;
    mockAuth.token = null;
    renderNavbar();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('shows Dashboard and Logout when authenticated', () => {
    mockAuth.isAuthenticated = true;
    mockAuth.token = 'valid';
    mockAuth.email = 'admin@test.com';
    renderNavbar();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getByText('admin@test.com')).toBeInTheDocument();
  });

  it('renders app title as a link', () => {
    mockAuth.isAuthenticated = false;
    renderNavbar();
    const titleLink = screen.getByText('DevTools Portal');
    expect(titleLink).toBeInTheDocument();
    expect(titleLink.closest('a')).toHaveAttribute('href', '/');
  });
});

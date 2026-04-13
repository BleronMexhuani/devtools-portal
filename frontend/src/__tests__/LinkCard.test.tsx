import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LinkCard } from '../components/LinkCard';
import type { Link } from '../types';

const baseLink: Link = {
  _id: '1',
  title: 'GitHub',
  url: 'https://github.com',
  description: 'Code hosting platform',
  icon: '🐙',
  category: 'Development',
  sortOrder: 0,
  categoryOrder: 0,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('LinkCard', () => {
  it('renders link title and description', () => {
    render(<LinkCard link={baseLink} />);
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Code hosting platform')).toBeInTheDocument();
  });

  it('renders as a link to the URL', () => {
    render(<LinkCard link={baseLink} />);
    const anchor = screen.getByRole('link');
    expect(anchor).toHaveAttribute('href', 'https://github.com');
    expect(anchor).toHaveAttribute('target', '_blank');
    expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders emoji icon', () => {
    render(<LinkCard link={baseLink} />);
    expect(screen.getByText('🐙')).toBeInTheDocument();
  });

  it('renders image icon for URL icons', () => {
    const link = { ...baseLink, icon: 'https://example.com/icon.png' };
    render(<LinkCard link={link} />);
    const img = screen.getByRole('presentation');
    expect(img).toHaveAttribute('src', 'https://example.com/icon.png');
  });

  it('renders image icon for uploaded file paths', () => {
    const link = { ...baseLink, icon: '/uploads/icon-123.png' };
    render(<LinkCard link={link} />);
    const img = screen.getByRole('presentation');
    expect(img).toHaveAttribute('src', expect.stringContaining('/uploads/icon-123.png'));
  });

  it('renders first letter fallback when no icon', () => {
    const link = { ...baseLink, icon: undefined };
    render(<LinkCard link={link} />);
    expect(screen.getByText('G')).toBeInTheDocument();
  });

  it('renders without description', () => {
    const link = { ...baseLink, description: undefined };
    render(<LinkCard link={link} />);
    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });
});

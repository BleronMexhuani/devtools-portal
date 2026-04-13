import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { LinkForm } from '../components/LinkForm';
import type { Link } from '../types';

// Mock the upload API
vi.mock('../services/api', () => ({
  uploadIcon: vi.fn().mockResolvedValue('/uploads/icon-test.png'),
}));

describe('LinkForm', () => {
  const mockSubmit = vi.fn().mockResolvedValue(undefined);
  const mockCancel = vi.fn();

  it('renders all form fields', () => {
    render(<LinkForm onSubmit={mockSubmit} onCancel={mockCancel} />);
    expect(screen.getByText(/title \*/i)).toBeInTheDocument();
    expect(screen.getByText(/url \*/i)).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
  });

  it('shows "Create Link" button for new links', () => {
    render(<LinkForm onSubmit={mockSubmit} onCancel={mockCancel} />);
    expect(screen.getByRole('button', { name: /create link/i })).toBeInTheDocument();
  });

  it('shows "Update Link" button when editing', () => {
    const existing: Link = {
      _id: '1',
      title: 'Test',
      url: 'https://test.com',
      sortOrder: 0,
      categoryOrder: 0,
      createdAt: '',
      updatedAt: '',
    };
    render(<LinkForm initial={existing} onSubmit={mockSubmit} onCancel={mockCancel} />);
    expect(screen.getByRole('button', { name: /update link/i })).toBeInTheDocument();
  });

  it('pre-fills form when editing', () => {
    const existing: Link = {
      _id: '1',
      title: 'GitHub',
      url: 'https://github.com',
      description: 'Code hosting',
      icon: '🐙',
      category: 'Dev',
      sortOrder: 5,
      categoryOrder: 0,
      createdAt: '',
      updatedAt: '',
    };
    render(<LinkForm initial={existing} onSubmit={mockSubmit} onCancel={mockCancel} />);
    expect(screen.getByDisplayValue('GitHub')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://github.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Code hosting')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Dev')).toBeInTheDocument();
  });

  it('calls onCancel when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<LinkForm onSubmit={mockSubmit} onCancel={mockCancel} />);
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockCancel).toHaveBeenCalled();
  });

  it('calls onSubmit with form data', async () => {
    const user = userEvent.setup();
    render(<LinkForm onSubmit={mockSubmit} onCancel={mockCancel} />);

    const textInputs = screen.getAllByRole('textbox');
    const titleInput = textInputs[0]; // first text input (title)
    const urlInputEl = document.querySelector('input[type="url"]') as HTMLInputElement;
    
    await user.type(titleInput, 'New Link');
    await user.type(urlInputEl, 'https://example.com');
    await user.click(screen.getByRole('button', { name: /create link/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Link',
          url: 'https://example.com',
        }),
      );
    });
  });

  it('shows error when submit fails', async () => {
    const failSubmit = vi.fn().mockRejectedValue(new Error('Server error'));
    const user = userEvent.setup();
    render(<LinkForm onSubmit={failSubmit} onCancel={mockCancel} />);

    const textInputs = screen.getAllByRole('textbox');
    const titleInput = textInputs[0];
    const urlInputEl = document.querySelector('input[type="url"]') as HTMLInputElement;

    await user.type(titleInput, 'Fail');
    await user.type(urlInputEl, 'https://example.com');
    await user.click(screen.getByRole('button', { name: /create link/i }));

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('has file upload button', () => {
    render(<LinkForm onSubmit={mockSubmit} onCancel={mockCancel} />);
    expect(screen.getByText(/upload icon file/i)).toBeInTheDocument();
  });
});

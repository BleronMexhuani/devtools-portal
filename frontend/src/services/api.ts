import type { Link, LinkFormData, AuthResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

/** Fetch all links (public) */
export async function fetchLinks(): Promise<Link[]> {
  const res = await fetch(`${API_URL}/links`);
  return handleResponse<Link[]>(res);
}

/** Admin login */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AuthResponse>(res);
}

/** Create a new link (admin) */
export async function createLink(data: LinkFormData): Promise<Link> {
  const res = await fetch(`${API_URL}/links`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Link>(res);
}

/** Update a link (admin) */
export async function updateLink(id: string, data: Partial<LinkFormData>): Promise<Link> {
  const res = await fetch(`${API_URL}/links/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Link>(res);
}

/** Delete a link (admin) */
export async function deleteLink(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/links/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse<void>(res);
}

/** Bulk reorder links (admin) */
export async function reorderLinks(orders: { id: string; sortOrder: number }[]): Promise<void> {
  const res = await fetch(`${API_URL}/links/reorder`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ orders }),
  });
  return handleResponse<void>(res);
}

/** Upload an icon file (admin) — returns the icon URL */
export async function uploadIcon(file: File): Promise<string> {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('icon', file);

  const res = await fetch(`${API_URL}/uploads/icon`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await handleResponse<{ url: string }>(res);
  return data.url;
}

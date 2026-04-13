import { useState } from 'react';
import { useLinks } from '../hooks/useLinks';
import { LinkForm } from '../components/LinkForm';
import { createLink, updateLink, deleteLink } from '../services/api';
import type { Link, LinkFormData } from '../types';

export function AdminPage() {
  const { links, loading, error, reload } = useLinks();
  const [editing, setEditing] = useState<Link | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function handleCreate(data: LinkFormData) {
    await createLink(data);
    setShowForm(false);
    await reload();
  }

  async function handleUpdate(data: LinkFormData) {
    if (!editing) return;
    await updateLink(editing._id, data);
    setEditing(null);
    await reload();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this link?')) return;
    await deleteLink(id);
    await reload();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Links</h1>
        {!showForm && !editing && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            + Add Link
          </button>
        )}
      </div>

      {(showForm || editing) && (
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {editing ? 'Edit Link' : 'New Link'}
          </h2>
          <LinkForm
            initial={editing}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700 mb-4">{error}</div>
      )}

      {!loading && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Link
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Order
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {links.map((link) => (
                <tr key={link._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{link.icon || '🔗'}</span>
                      <div>
                        <div className="font-medium text-gray-900">{link.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{link.url}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{link.category || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{link.sortOrder}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setEditing(link)}
                      className="mr-3 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(link._id)}
                      className="text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {links.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No links yet. Click &quot;+ Add Link&quot; to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

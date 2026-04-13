import { useState, useRef } from 'react';
import { useLinks } from '../hooks/useLinks';
import { LinkForm } from '../components/LinkForm';
import { createLink, updateLink, deleteLink, reorderLinks } from '../services/api';
import type { Link, LinkFormData } from '../types';

/** Group links by category */
function groupByCategory(links: Link[]): Record<string, Link[]> {
  const groups: Record<string, Link[]> = {};
  for (const link of links) {
    const cat = link.category || 'Uncategorized';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(link);
  }
  return groups;
}

function IconDisplay({ icon, title }: { icon?: string; title: string }) {
  const isImage = icon && (icon.startsWith('/uploads/') || icon.startsWith('http'));
  if (isImage) {
    return <img src={icon} alt="" className="h-8 w-8 rounded object-cover" />;
  }
  return <span className="text-lg">{icon || title.charAt(0)}</span>;
}

export function AdminPage() {
  const { links, loading, error, reload } = useLinks();
  const [editing, setEditing] = useState<Link | null>(null);
  const [showForm, setShowForm] = useState(false);
  const dragItem = useRef<{ id: string; category: string } | null>(null);
  const dragOverItem = useRef<{ id: string; category: string } | null>(null);

  const grouped = groupByCategory(links);

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

  function handleDragStart(linkId: string, category: string) {
    dragItem.current = { id: linkId, category };
  }

  function handleDragOver(e: React.DragEvent, linkId: string, category: string) {
    e.preventDefault();
    dragOverItem.current = { id: linkId, category };
  }

  async function handleDrop(e: React.DragEvent, category: string) {
    e.preventDefault();
    if (!dragItem.current || !dragOverItem.current) return;

    // Only allow reorder within the same category
    if (dragItem.current.category !== category || dragOverItem.current.category !== category) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    const categoryLinks = [...(grouped[category] || [])];
    const fromIndex = categoryLinks.findIndex((l) => l._id === dragItem.current!.id);
    const toIndex = categoryLinks.findIndex((l) => l._id === dragOverItem.current!.id);

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    // Reorder the array
    const [moved] = categoryLinks.splice(fromIndex, 1);
    categoryLinks.splice(toIndex, 0, moved);

    // Build new sort orders
    const orders = categoryLinks.map((link, index) => ({
      id: link._id,
      sortOrder: index,
    }));

    dragItem.current = null;
    dragOverItem.current = null;

    try {
      await reorderLinks(orders);
      await reload();
    } catch {
      // Reload to reset to server state
      await reload();
    }
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

      {!loading && links.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500 shadow-sm">
          No links yet. Click &quot;+ Add Link&quot; to create one.
        </div>
      )}

      {!loading &&
        Object.entries(grouped).map(([category, categoryLinks]) => (
          <div key={category} className="mb-6">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
              {category}
            </h2>
            <div
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              onDrop={(e) => handleDrop(e, category)}
              onDragOver={(e) => e.preventDefault()}
            >
              {categoryLinks.map((link, index) => (
                <div
                  key={link._id}
                  draggable
                  onDragStart={() => handleDragStart(link._id, category)}
                  onDragOver={(e) => handleDragOver(e, link._id, category)}
                  className={`flex items-center gap-4 px-5 py-3 hover:bg-gray-50 cursor-grab active:cursor-grabbing transition ${
                    index > 0 ? 'border-t border-gray-100' : ''
                  }`}
                >
                  {/* Drag handle */}
                  <span className="text-gray-300 hover:text-gray-500 select-none" title="Drag to reorder">
                    ⠿
                  </span>

                  {/* Position number */}
                  <span className="w-6 text-center text-xs font-medium text-gray-400">
                    {index + 1}
                  </span>

                  {/* Icon */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                    <IconDisplay icon={link.icon} title={link.title} />
                  </div>

                  {/* Title & URL */}
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900">{link.title}</div>
                    <div className="text-sm text-gray-400 truncate">{link.url}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setEditing(link)}
                      className="rounded px-2.5 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(link._id)}
                      className="rounded px-2.5 py-1 text-sm font-medium text-red-600 hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

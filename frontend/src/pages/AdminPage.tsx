import { useState, useRef } from 'react';
import { useLinks } from '../hooks/useLinks';
import { LinkForm } from '../components/LinkForm';
import { createLink, updateLink, deleteLink, reorderLinks, reorderCategories } from '../services/api';
import type { Link, LinkFormData } from '../types';

/** Group links by category, preserving order from backend (categoryOrder, sortOrder) */
function groupByCategory(links: Link[]): [string, Link[]][] {
  const map = new Map<string, Link[]>();
  for (const link of links) {
    const cat = link.category || 'Uncategorized';
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(link);
  }
  return Array.from(map.entries());
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

  // Link-level drag refs
  const dragItem = useRef<{ id: string; category: string } | null>(null);
  const dragOverItem = useRef<{ id: string; category: string } | null>(null);

  // Category-level drag refs
  const dragCat = useRef<string | null>(null);
  const dragOverCat = useRef<string | null>(null);

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

  // --- Link reordering within a category ---
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

    if (dragItem.current.category !== category || dragOverItem.current.category !== category) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    const categoryLinks = [...(grouped.find(([c]) => c === category)?.[1] || [])];
    const fromIndex = categoryLinks.findIndex((l) => l._id === dragItem.current!.id);
    const toIndex = categoryLinks.findIndex((l) => l._id === dragOverItem.current!.id);

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    const [moved] = categoryLinks.splice(fromIndex, 1);
    categoryLinks.splice(toIndex, 0, moved);

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
      await reload();
    }
  }

  // --- Category reordering ---
  function handleCatDragStart(e: React.DragEvent, category: string) {
    e.dataTransfer.effectAllowed = 'move';
    dragCat.current = category;
  }

  function handleCatDragOver(e: React.DragEvent, category: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dragOverCat.current = category;
  }

  async function handleCatDrop(e: React.DragEvent) {
    e.preventDefault();
    if (!dragCat.current || !dragOverCat.current || dragCat.current === dragOverCat.current) {
      dragCat.current = null;
      dragOverCat.current = null;
      return;
    }

    const categories = grouped.map(([c]) => c);
    const fromIndex = categories.indexOf(dragCat.current);
    const toIndex = categories.indexOf(dragOverCat.current);

    if (fromIndex === -1 || toIndex === -1) {
      dragCat.current = null;
      dragOverCat.current = null;
      return;
    }

    const [moved] = categories.splice(fromIndex, 1);
    categories.splice(toIndex, 0, moved);

    const orders = categories.map((cat, index) => ({
      category: cat,
      categoryOrder: index,
    }));

    dragCat.current = null;
    dragOverCat.current = null;

    try {
      await reorderCategories(orders);
      await reload();
    } catch {
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
        grouped.map(([category, categoryLinks]) => (
          <div
            key={category}
            className="mb-6"
            onDragOver={(e) => {
              // Only accept category drags (not link drags)
              if (dragCat.current) handleCatDragOver(e, category);
            }}
            onDrop={(e) => {
              if (dragCat.current) handleCatDrop(e);
            }}
          >
            <div
              draggable
              onDragStart={(e) => handleCatDragStart(e, category)}
              onDragEnd={() => { dragCat.current = null; dragOverCat.current = null; }}
              className="mb-2 flex items-center gap-2 cursor-grab active:cursor-grabbing group"
            >
              <span className="text-gray-300 group-hover:text-gray-500 select-none text-lg" title="Drag to reorder category">
                ⠿
              </span>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                {category}
              </h2>
            </div>
            <div
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              onDrop={(e) => { if (dragItem.current) handleDrop(e, category); }}
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
                  <span className="w-6 text-center text-xs font-medium text-gray-400">
                    {index + 1}
                  </span>

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                    <IconDisplay icon={link.icon} title={link.title} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900">{link.title}</div>
                    <div className="text-sm text-gray-400 truncate">{link.url}</div>
                  </div>

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

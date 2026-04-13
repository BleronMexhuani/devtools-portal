import { useState, useEffect, useRef } from 'react';
import type { Link, LinkFormData } from '../types';
import { uploadIcon } from '../services/api';

interface LinkFormProps {
  initial?: Link | null;
  onSubmit: (data: LinkFormData) => Promise<void>;
  onCancel: () => void;
}

export function LinkForm({ initial, onSubmit, onCancel }: LinkFormProps) {
  const [form, setForm] = useState<LinkFormData>({
    title: '',
    url: '',
    description: '',
    icon: '',
    category: '',
    sortOrder: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title,
        url: initial.url,
        description: initial.description || '',
        icon: initial.icon || '',
        category: initial.category || '',
        sortOrder: initial.sortOrder ?? 0,
      });
    }
  }, [initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const iconUrl = await uploadIcon(file);
      setForm((prev) => ({ ...prev, icon: iconUrl }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload icon');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function update(field: keyof LinkFormData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Determine if icon is an uploaded file path or URL
  const iconPreview = form.icon && (form.icon.startsWith('/uploads/') || form.icon.startsWith('http'));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">Title *</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">URL *</label>
        <input
          type="url"
          required
          value={form.url}
          onChange={(e) => update('url', e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          rows={2}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Icon</label>
          <div className="mt-1 flex items-center gap-3">
            {iconPreview && (
              <img
                src={form.icon}
                alt="Icon preview"
                className="h-10 w-10 rounded object-cover border border-gray-200"
              />
            )}
            {form.icon && !iconPreview && (
              <span className="text-2xl">{form.icon}</span>
            )}
            <input
              type="text"
              value={form.icon}
              onChange={(e) => update('icon', e.target.value)}
              placeholder="Emoji, URL, or upload a file"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {uploading ? 'Uploading...' : 'Upload icon file'}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/svg+xml,image/webp"
                onChange={handleFileUpload}
                disabled={uploading}
                className="sr-only"
              />
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : initial ? 'Update Link' : 'Create Link'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

import { useLinks } from '../hooks/useLinks';
import { LinkCard } from '../components/LinkCard';
import type { Link } from '../types';

/** Group links by category, preserving sort order within each group */
function groupByCategory(links: Link[]): Record<string, Link[]> {
  const groups: Record<string, Link[]> = {};
  for (const link of links) {
    const cat = link.category || 'Uncategorized';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(link);
  }
  return groups;
}

export function HomePage() {
  const { links, loading, error } = useLinks();
  const grouped = groupByCategory(links);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Developer Tools
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          A curated collection of essential developer tools and resources.
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="mx-auto max-w-md rounded-lg bg-red-50 p-4 text-center text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && Object.keys(grouped).length === 0 && (
        <p className="text-center text-gray-500 py-20">No links available yet.</p>
      )}

      {Object.entries(grouped).map(([category, categoryLinks]) => (
        <section key={category} className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
            {category}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryLinks.map((link) => (
              <LinkCard key={link._id} link={link} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

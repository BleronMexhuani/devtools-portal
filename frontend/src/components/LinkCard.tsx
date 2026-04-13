import type { Link } from '../types';

interface LinkCardProps {
  link: Link;
}

export function LinkCard({ link }: LinkCardProps) {
  const isImageUrl = link.icon && (link.icon.startsWith('http') || link.icon.startsWith('/uploads/'));
  const isEmoji = link.icon && !isImageUrl;

  function resolveIconSrc(icon: string): string {
    // /uploads/ paths are served by nginx proxy in Docker, or directly by Express in dev
    return icon;
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-indigo-300"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-2xl group-hover:bg-indigo-100 transition">
          {isEmoji ? (
            link.icon
          ) : link.icon ? (
            <img src={resolveIconSrc(link.icon)} alt="" className="h-7 w-7 rounded" />
          ) : (
            <span className="text-indigo-500 text-lg font-bold">{link.title.charAt(0)}</span>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition truncate">
            {link.title}
          </h3>
          {link.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{link.description}</p>
          )}
        </div>
      </div>
    </a>
  );
}

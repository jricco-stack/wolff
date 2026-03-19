import Link from 'next/link';

interface AppHeaderProps {
  backHref?: string;
  backLabel?: string;
  subtitle?: string;
}

export function AppHeader({ backHref, backLabel = 'Back', subtitle }: AppHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-blue-950 to-blue-800 text-white px-4 py-4 shadow-md">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              aria-label={backLabel}
              className="flex items-center gap-1.5 text-blue-300 hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm sr-only sm:not-sr-only">{backLabel}</span>
            </Link>
          )}
          <Link
            href="/"
            className="font-bold text-lg tracking-tight hover:text-blue-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
          >
            AppealKit
          </Link>
        </div>
        {subtitle && (
          <span className="text-blue-200 text-sm font-medium">{subtitle}</span>
        )}
      </div>
    </header>
  );
}

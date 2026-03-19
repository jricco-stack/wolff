interface StepIndicatorProps {
  steps: string[];
  current: number; // 1-indexed
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol role="list" className="flex items-center justify-center gap-0">
        {steps.map((label, i) => {
          const num = i + 1;
          const done = num < current;
          const active = num === current;
          return (
            <li key={num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  aria-current={active ? 'step' : undefined}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-200 ${
                    done
                      ? 'bg-emerald-500 text-white'
                      : active
                      ? 'bg-blue-700 text-white ring-4 ring-blue-100'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {done ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span aria-hidden="true">{num}</span>
                  )}
                  <span className="sr-only">
                    {done ? `${label} - completed` : active ? `${label} - current step` : `${label} - upcoming`}
                  </span>
                </div>
                <span
                  className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                    active ? 'text-blue-700' : done ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                  aria-hidden="true"
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mb-5 mx-1 transition-colors duration-300 ${
                    num < current ? 'bg-emerald-400' : 'bg-slate-200'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

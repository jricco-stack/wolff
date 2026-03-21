'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '../components/AppHeader';

type DocType = 'fema' | 'insurance' | 'adjuster' | 'other';

interface DocOption {
  id: DocType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  border: string;
  bg: string;
}

const DOC_OPTIONS: DocOption[] = [
  {
    id: 'fema',
    title: 'FEMA Determination Letter',
    description: 'Denial or decision letter from FEMA Individual Assistance',
    color: 'text-blue-700',
    border: 'border-blue-300',
    bg: 'bg-blue-50',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'insurance',
    title: 'Insurance Denial Letter',
    description: 'Denial from your homeowner, renter, or flood insurance carrier',
    color: 'text-amber-700',
    border: 'border-amber-300',
    bg: 'bg-amber-50',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    id: 'adjuster',
    title: "Adjuster's Estimate / Report",
    description: 'Damage estimate or scope of loss from an insurance adjuster',
    color: 'text-emerald-700',
    border: 'border-emerald-300',
    bg: 'bg-emerald-50',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'other',
    title: 'Other Document',
    description: 'Any other claim-related document you want analyzed',
    color: 'text-slate-600',
    border: 'border-slate-300',
    bg: 'bg-slate-50',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
];

type UploadStatus = 'idle' | 'uploading' | 'done' | 'error';

function getOrCreateSessionId(): string {
  let sid = localStorage.getItem('claimback-session-id');
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem('claimback-session-id', sid);
  }
  return sid;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<DocType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId();
  }, []);

  const handleSelect = (id: DocType) => {
    if (id === 'fema') {
      router.push('/upload');
      return;
    }
    setSelected(id);
    setFile(null);
    setError(null);
    setStatus('idle');
  };

  const handleFile = (f: File) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(f.type)) {
      setError('Please upload a JPG, PNG, WebP, or PDF file.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File must be under 10 MB.');
      return;
    }
    setFile(f);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleAnalyze = async () => {
    if (!file || !selected) return;
    setStatus('uploading');
    setError(null);

    try {
      setStatusMsg('Reading file…');
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setStatusMsg('Analyzing with AI…');
      const endpoint =
        selected === 'adjuster' ? '/api/analyze-adjuster' : '/api/analyze-insurance';

      const sessionId = sessionIdRef.current;
      const body =
        selected === 'adjuster'
          ? JSON.stringify({ file: base64, mimeType: file.type, sessionId })
          : JSON.stringify({ file: base64, mimeType: file.type, documentType: selected, sessionId });

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      setStatus('done');

      if (selected === 'adjuster') {
        router.push(`/adjuster-review/${data.caseId}`);
      } else {
        router.push(`/insurance-results/${data.caseId}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setError(message);
      setStatus('error');
    }
  };

  const canUpload = selected && selected !== 'fema';

  return (
    <main id="main-content" className="min-h-screen bg-slate-50 flex flex-col">
      <AppHeader subtitle="Document Hub" />

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Upload a document</h1>
          <p className="text-slate-500 text-sm">
            Select the type of document you have. We&apos;ll analyze it and guide your next steps.
          </p>
        </div>

        {/* Type selector */}
        <div className="grid grid-cols-1 gap-3 mb-8" role="group" aria-label="Document type">
          {DOC_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              aria-pressed={selected === opt.id}
              className={`flex items-center gap-4 w-full text-left p-4 rounded-2xl border-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                selected === opt.id
                  ? `${opt.border} ${opt.bg}`
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className={`flex-shrink-0 ${selected === opt.id ? opt.color : 'text-slate-400'}`}>
                {opt.icon}
              </span>
              <span className="flex-1 min-w-0">
                <span className={`block font-semibold text-sm ${selected === opt.id ? opt.color : 'text-slate-800'}`}>
                  {opt.title}
                </span>
                <span className="block text-xs text-slate-500 mt-0.5">{opt.description}</span>
              </span>
              {opt.id === 'fema' && (
                <span className="text-xs text-slate-400 flex items-center gap-1 flex-shrink-0">
                  Go to upload
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              )}
              {selected === opt.id && opt.id !== 'fema' && (
                <svg className="w-5 h-5 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>

        {/* Dropzone — only shown when non-FEMA type selected */}
        {canUpload && (
          <div className="space-y-4">
            <div
              role="button"
              tabIndex={0}
              aria-label={`Upload ${DOC_OPTIONS.find((o) => o.id === selected)?.title} — click or drag file here`}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                isDragging
                  ? 'border-blue-400 bg-blue-50'
                  : file
                  ? 'border-emerald-400 bg-emerald-50'
                  : 'border-slate-300 bg-white hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                id="doc-upload"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                className="sr-only"
                aria-label="Choose document file"
                onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />

              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center" aria-hidden="true">
                    <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-semibold text-emerald-800 text-sm">{file.name}</p>
                  <p className="text-xs text-emerald-600">{(file.size / 1024).toFixed(0)} KB — click to change</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center" aria-hidden="true">
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 text-sm">Drop your document here</p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP, or PDF — up to 10 MB</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex gap-2 items-start">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {status === 'uploading' && (
              <div role="status" aria-live="polite" className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-blue-800">
                <svg className="animate-spin w-4 h-4 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {statusMsg}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!file || status === 'uploading'}
              className="w-full bg-blue-700 text-white py-4 rounded-2xl font-bold text-base shadow-md hover:bg-blue-800 transition-all duration-200 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 min-h-[52px] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {status === 'uploading' ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing…
                </>
              ) : (
                <>
                  Analyze document
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}

        {!canUpload && !selected && (
          <p className="text-center text-sm text-slate-400 mt-2">Select a document type above to upload.</p>
        )}
      </div>
    </main>
  );
}

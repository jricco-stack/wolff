'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

const FILE_TYPES = [
  { ext: 'PDF', color: 'bg-red-100 text-red-700 border-red-200' },
  { ext: 'JPG', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { ext: 'PNG', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { ext: 'WebP', color: 'bg-purple-100 text-purple-700 border-purple-200' },
];

const TIPS = [
  'Make sure the entire letter is visible and not cut off',
  'Use good lighting if taking a photo — avoid shadows or glare',
  'Include the date, your name, and FEMA application number',
  'Both sides of the letter are important — upload all pages',
];

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(f.type)) {
      setError('Please upload a PDF or image file (JPG, PNG, WebP).');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB.');
      return;
    }
    setError(null);
    setFile(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !file) {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  const handleSubmit = async () => {
    if (!file || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      router.push(`/results/${data.caseId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setError(message);
      setIsLoading(false);
    }
  };

  const fileExt = file?.name.split('.').pop()?.toUpperCase() ?? '';

  return (
    <main id="main-content" className="min-h-screen bg-slate-50 pt-20">
      {/* Page header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Step 1 of 3</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
            Upload your FEMA denial letter
          </h1>
          <p className="text-slate-500">
            Upload the denial letter FEMA mailed or emailed you. We&apos;ll explain exactly what it means and generate your appeal.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Main upload area */}
          <div className="lg:col-span-2 space-y-5">
            {/* Drop zone */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload your FEMA denial letter. Press Enter or Space to open file picker."
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onKeyDown={onKeyDown}
              onClick={() => !file && inputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                  : file
                  ? 'border-emerald-400 bg-emerald-50'
                  : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/30'
              }`}
            >
              {file ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto" aria-hidden="true">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{file.name}</p>
                    <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(0)} KB · {fileExt}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    aria-label="Remove selected file"
                    className="text-sm text-red-500 hover:text-red-700 font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-base font-semibold text-slate-700 mb-1">
                    {isDragging ? 'Drop your file here' : 'Drag your letter here'}
                  </p>
                  <p className="text-slate-400 text-sm mb-5">or click to choose a file</p>
                  <span
                    aria-hidden="true"
                    className="inline-block bg-[#2563EB] text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
                  >
                    Choose file
                  </span>
                </div>
              )}
              <input
                ref={inputRef}
                id="fema-letter-input"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                aria-label="Choose FEMA denial letter file"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>

            {/* File type badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 font-medium">Accepted formats:</span>
              {FILE_TYPES.map(({ ext, color }) => (
                <span key={ext} className={`text-xs font-bold px-2.5 py-1 rounded-full border ${color}`}>
                  {ext}
                </span>
              ))}
              <span className="text-xs text-slate-400 ml-1">· Max 10MB</span>
            </div>

            {/* Trust row */}
            <div className="flex items-center justify-center gap-6 py-3 px-4 bg-white rounded-xl border border-slate-100 shadow-sm">
              {[
                { label: 'Encrypted', iconPath: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
                { label: 'Private', iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                { label: 'Secure', iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
              ].map(({ label, iconPath }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                    </svg>
                  </div>
                  <span className="font-medium">{label}</span>
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex gap-2 items-start">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!file || isLoading}
              className="w-full bg-[#2563EB] text-white py-4 rounded-2xl font-bold text-base shadow-md hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 min-h-[52px]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing your letter…
                </>
              ) : (
                <>
                  Analyze my letter
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {isLoading ? 'Analyzing your letter, please wait 15 to 30 seconds.' : ''}
            </div>

            {isLoading && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700 text-center">
                This takes 15–30 seconds. Please don&apos;t close this page.
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Tips card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="font-bold text-slate-900 text-sm">Tips for best results</h2>
              </div>
              <ol className="space-y-3">
                {TIPS.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-600 leading-snug">{tip}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Deadline warning card */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="font-bold text-amber-900 text-sm">Remember your deadline</h2>
              </div>
              <p className="text-sm text-amber-800 leading-relaxed">
                You have <strong>60 days</strong> from the date on your FEMA letter to file an appeal. Upload now to track your exact deadline.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

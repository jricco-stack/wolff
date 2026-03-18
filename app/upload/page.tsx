'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = ['Upload letter', 'Review denial', 'Get letter'];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((label, i) => {
        const num = i + 1;
        const done = num < current;
        const active = num === current;
        return (
          <div key={num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                done ? 'bg-emerald-500 text-white' : active ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {done ? '✓' : num}
              </div>
              <span className={`text-xs mt-1 font-medium whitespace-nowrap ${active ? 'text-blue-700' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
            {i < 2 && <div className={`w-12 h-0.5 mb-5 mx-1 ${num < current ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
          </div>
        );
      })}
    </div>
  );
}

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

  const handleSubmit = async () => {
    if (!file) return;
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
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-gradient-to-r from-blue-950 to-blue-800 text-white px-4 py-4 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <svg className="w-4 h-4 text-blue-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-bold text-lg">AppealKit</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <StepIndicator current={1} />

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload your FEMA letter</h2>
          <p className="text-slate-500 text-sm">
            Upload the denial letter FEMA mailed or emailed you. We&apos;ll read it and explain your options.
          </p>
        </div>

        {/* Drop zone */}
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-blue-500 bg-blue-50 scale-[1.01]'
              : file
              ? 'border-emerald-400 bg-emerald-50'
              : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/30'
          }`}
        >
          {file ? (
            <div className="space-y-3">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
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
                className="text-sm text-red-500 hover:text-red-700 font-medium hover:underline"
              >
                Remove file
              </button>
            </div>
          ) : (
            <label className="cursor-pointer block">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-base font-semibold text-slate-700 mb-1">
                {isDragging ? 'Drop your file here' : 'Drag your letter here'}
              </p>
              <p className="text-slate-400 text-sm mb-4">or click to choose a file</p>
              <span className="inline-block bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800 transition shadow-sm">
                Choose file
              </span>
              <p className="text-xs text-slate-400 mt-4">PDF, JPG, PNG, or WebP · Max 10MB</p>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </label>
          )}
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex gap-2 items-start">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!file || isLoading}
          className="mt-5 w-full bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg shadow-md hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-lg flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing your letter…
            </>
          ) : (
            <>
              Analyze my letter
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>

        {isLoading && (
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700 text-center">
            This takes 15–30 seconds. Please don&apos;t close this page.
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Your file is processed securely and never stored on our servers
        </div>
      </div>
    </main>
  );
}

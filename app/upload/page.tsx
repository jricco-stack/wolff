'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

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

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

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

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-900 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <a href="/" className="text-blue-200 hover:text-white text-sm">← Back</a>
          <h1 className="text-lg font-bold">AppealKit</h1>
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload your FEMA letter</h2>
          <p className="text-gray-600">
            Upload the denial letter FEMA mailed or emailed you. We&apos;ll read it and explain your options.
          </p>
        </div>

        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
          } ${file ? 'border-green-500 bg-green-50' : ''}`}
        >
          {file ? (
            <div>
              <div className="text-4xl mb-3">✅</div>
              <p className="font-semibold text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(0)} KB</p>
              <button
                onClick={() => setFile(null)}
                className="mt-3 text-sm text-red-600 hover:underline"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div>
              <div className="text-5xl mb-4">📄</div>
              <p className="text-lg font-semibold text-gray-700 mb-1">
                Drag your letter here
              </p>
              <p className="text-gray-500 text-sm mb-4">or</p>
              <label className="cursor-pointer bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition">
                Choose file
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </label>
              <p className="text-xs text-gray-400 mt-4">PDF, JPG, PNG, or WebP · Max 10MB</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!file || isLoading}
          className="mt-6 w-full bg-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
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
            'Analyze my letter →'
          )}
        </button>

        {isLoading && (
          <p className="text-center text-sm text-gray-500 mt-3">
            This takes 15–30 seconds. Please don&apos;t close this page.
          </p>
        )}
      </div>
    </main>
  );
}

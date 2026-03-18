'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LetterPage({ params }: { params: { caseId: string } }) {
  const [letter, setLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateLetter = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: params.caseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate letter');
      setLetter(data.letter);
      setIsGenerated(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadLetter = () => {
    const blob = new Blob([letter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FEMA-Appeal-Letter-${params.caseId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyLetter = () => {
    navigator.clipboard.writeText(letter);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-900 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href={`/results/${params.caseId}`} className="text-blue-200 hover:text-white text-sm">
            ← Back
          </Link>
          <h1 className="text-lg font-bold">AppealKit</h1>
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your appeal letter</h2>
          <p className="text-gray-600 text-sm">
            We&apos;ll write a complete letter for you. You can edit it before sending.
          </p>
        </div>

        {!isGenerated && !isGenerating && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-5xl mb-4">✉️</div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Ready to write your letter</h3>
            <p className="text-gray-600 text-sm mb-6">
              We&apos;ll generate a professional appeal letter based on your denial reason and case details.
            </p>
            <button
              onClick={generateLetter}
              className="w-full bg-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition"
            >
              Write my appeal letter
            </button>
          </div>
        )}

        {isGenerating && (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
            <svg className="animate-spin h-10 w-10 text-blue-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="font-semibold text-gray-700">Writing your appeal letter…</p>
            <p className="text-sm text-gray-500 mt-2">This takes about 15–20 seconds.</p>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {isGenerated && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-amber-800 text-sm font-medium">
                📝 Review and personalize this letter before sending.
                Fill in any bracketed placeholders like [DATE].
              </p>
            </div>

            <textarea
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
              className="w-full h-96 p-4 border border-gray-200 rounded-xl font-mono text-sm text-gray-800 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              spellCheck
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={copyLetter}
                className="bg-white border-2 border-blue-700 text-blue-700 py-3 rounded-xl font-bold hover:bg-blue-50 transition"
              >
                Copy text
              </button>
              <button
                onClick={downloadLetter}
                className="bg-blue-700 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition"
              >
                Download .txt
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <h4 className="font-bold text-blue-900 mb-2">How to send your appeal</h4>
              <ol className="text-sm text-blue-800 space-y-1.5 list-decimal list-inside">
                <li>Print two copies of this letter</li>
                <li>Gather documents from your checklist</li>
                <li>Mail everything via USPS Certified Mail (keep your receipt)</li>
                <li>Or call FEMA at 1-800-621-3362 to submit by phone</li>
                <li>Or visit DisasterAssistance.gov to submit online</li>
              </ol>
            </div>

            <p className="text-center text-xs text-gray-400 pb-6">
              AppealKit does not provide legal advice. For complex cases, contact a legal aid organization.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

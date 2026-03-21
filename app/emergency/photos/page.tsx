'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppHeader } from '../../components/AppHeader';
import type { InventoryItem } from '@/lib/claude';

// ── Checklist data ─────────────────────────────────────────────────────────

const ROOM_ITEMS = [
  'Wide shot from doorway',
  'Close-up of each damaged area',
  'Any water stains or structural damage',
];

const CHECKLIST: { section: string; items: string[] }[] = [
  {
    section: 'Exterior',
    items: [
      'All 4 sides of the home',
      'Roof (from ground level if unsafe to climb)',
      'Foundation and basement entry',
      'Driveway, fencing, outbuildings',
    ],
  },
  { section: 'Living Room', items: ROOM_ITEMS },
  { section: 'Kitchen', items: ROOM_ITEMS },
  { section: 'Primary Bedroom', items: ROOM_ITEMS },
  { section: 'Other Bedrooms', items: ROOM_ITEMS },
  { section: 'Bathrooms', items: ROOM_ITEMS },
  { section: 'Basement / Crawlspace', items: ROOM_ITEMS },
  { section: 'Garage', items: ROOM_ITEMS },
  {
    section: 'Appliances & Electronics',
    items: [
      'Serial number and model number label of each damaged item',
      'Overall condition photo',
    ],
  },
  {
    section: 'Valuables',
    items: [
      'Jewelry, art, collectibles (with something for scale)',
      'Any pre-disaster photos or receipts if available',
    ],
  },
  {
    section: 'Vehicles',
    items: [
      'All 4 sides',
      'Interior if water damaged',
      'VIN plate',
    ],
  },
];

const TOTAL_ITEMS = CHECKLIST.reduce((sum, s) => sum + s.items.length, 0);

const PHOTO_TIPS = [
  'Keep your hand or a common object in frame for scale',
  'Do NOT clean up or move items before photographing',
  'Turn on all lights in each room',
  "Show your phone's date/time in at least one photo per room",
  'Capture water lines on walls if applicable',
  'Photograph from multiple angles — wide then close-up',
];

// ── Helpers ────────────────────────────────────────────────────────────────

function itemKey(section: string, item: string) {
  return `${section}::${item}`;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // strip data URL prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function downloadCSV(items: InventoryItem[]) {
  const header = 'Item,Room,Est. Value (USD),Condition,Notes';
  const rows = items.map((i) =>
    [i.item, i.room, i.estimatedValue, i.condition, i.notes]
      .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
      .join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'damage-inventory.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ── Component ──────────────────────────────────────────────────────────────

export default function PhotosPage() {
  // Checklist state
  const [sessionId, setSessionId] = useState('');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Photo dropzone state
  const [photos, setPhotos] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Inventory state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  // Save state
  const [caseId, setCaseId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Init session + load persisted checklist
  useEffect(() => {
    let id = localStorage.getItem('claimback-session-id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('claimback-session-id', id);
    }
    setSessionId(id);
    const raw = localStorage.getItem(`photo-checklist-${id}`);
    if (raw) {
      try { setCheckedItems(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, []);

  // Persist checklist
  useEffect(() => {
    if (!sessionId) return;
    localStorage.setItem(`photo-checklist-${sessionId}`, JSON.stringify(checkedItems));
  }, [checkedItems, sessionId]);

  const toggleItem = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPct = Math.round((checkedCount / TOTAL_ITEMS) * 100);

  // ── Photo dropzone ──────────────────────────────────────────────────────

  const addFiles = (incoming: FileList | File[]) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    const valid: File[] = [];
    const errors: string[] = [];

    Array.from(incoming).forEach((f) => {
      if (!allowed.includes(f.type)) {
        errors.push(`${f.name}: must be JPG, PNG, or WebP`);
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        errors.push(`${f.name}: must be under 5MB`);
        return;
      }
      valid.push(f);
    });

    setPhotos((prev) => {
      const combined = [...prev, ...valid];
      if (combined.length > 10) {
        errors.push('Maximum 10 photos allowed');
        return prev.slice(0, 10);
      }
      return combined;
    });

    setPhotoError(errors.length ? errors[0] : null);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setPhotoError(null);
  };

  // ── Inventory analysis ──────────────────────────────────────────────────

  const analyzePhotos = async () => {
    if (photos.length === 0) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    setInventoryItems([]);
    setSaved(false);

    try {
      const images = await Promise.all(photos.map(fileToBase64));
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setInventoryItems(data.items);
    } catch (err: unknown) {
      setAnalysisError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Save to Supabase ────────────────────────────────────────────────────

  const saveInventory = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/inventory/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, items: inventoryItems }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSaved(true);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <main id="main-content" className="min-h-screen bg-slate-50 flex flex-col">
      <AppHeader backHref="/emergency" backLabel="Back to emergency guide" subtitle="Photo Documentation" />

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-6">

        {/* Progress bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">Documentation progress</span>
            <span className="text-sm font-bold text-blue-700">{checkedCount} of {TOTAL_ITEMS} items</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
              role="progressbar"
              aria-valuenow={checkedCount}
              aria-valuemin={0}
              aria-valuemax={TOTAL_ITEMS}
              aria-label={`${checkedCount} of ${TOTAL_ITEMS} photo items documented`}
            />
          </div>
          {checkedCount === TOTAL_ITEMS && (
            <p className="text-emerald-600 text-xs font-semibold mt-2">
              All items documented — great work!
            </p>
          )}
        </div>

        {/* Why photos matter */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-4 items-start">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center" aria-hidden="true">
            <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-blue-900 mb-1">Why photos matter</h2>
            <p className="text-blue-800 text-sm leading-relaxed">
              Your photos are your proof. Adjusters and FEMA reviewers use them to validate your claim.
              The more thorough, the stronger your case.
            </p>
          </div>
        </div>

        {/* Photo tips */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <h2 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Photo tips
          </h2>
          <ul className="space-y-2" role="list">
            {PHOTO_TIPS.map((tip) => (
              <li key={tip} className="flex items-start gap-2.5 text-sm text-amber-800">
                <svg className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Checklist sections */}
        {CHECKLIST.map(({ section, items }) => (
          <section key={section} aria-labelledby={`section-${section.replace(/\s+/g, '-')}`}>
            <h2
              id={`section-${section.replace(/\s+/g, '-')}`}
              className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2"
            >
              <span className="w-1.5 h-5 bg-blue-500 rounded-full flex-shrink-0" aria-hidden="true" />
              {section}
            </h2>
            <fieldset className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <legend className="sr-only">{section} photo checklist</legend>
              {items.map((item) => {
                const key = itemKey(section, item);
                const checked = !!checkedItems[key];
                return (
                  <label key={key} className="flex items-start gap-4 cursor-pointer group">
                    <div className="relative flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleItem(key)}
                        className="w-6 h-6 appearance-none rounded-md border-2 border-slate-300 bg-white checked:bg-emerald-500 checked:border-emerald-500 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-1 group-hover:border-blue-400"
                      />
                      {checked && (
                        <svg
                          className="absolute inset-0 w-6 h-6 text-white pointer-events-none"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm leading-snug pt-0.5 transition-colors ${checked ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      {item}
                    </span>
                  </label>
                );
              })}
            </fieldset>
          </section>
        ))}

        {/* ── Contents inventory section ── */}
        <section aria-labelledby="inventory-heading" className="space-y-5 pt-4">
          <div className="border-t border-slate-200 pt-6">
            <h2 id="inventory-heading" className="text-xl font-bold text-slate-900 mb-1">
              Generate your contents inventory
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Upload your damage photos and we&apos;ll identify items and estimate replacement values for your claim.
            </p>
          </div>

          {/* Multi-file dropzone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload damage photos. Press Enter or Space to open file picker."
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onKeyDown={onKeyDown}
            onClick={() => photos.length < 10 && inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
              isDragging
                ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                : photos.length > 0
                ? 'border-emerald-400 bg-emerald-50'
                : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/30'
            }`}
          >
            {photos.length > 0 ? (
              <div className="space-y-4">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto" aria-hidden="true">
                  <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-semibold text-slate-900">
                  {photos.length} photo{photos.length !== 1 ? 's' : ''} selected
                </p>
                <ul className="space-y-1.5 text-left max-w-xs mx-auto">
                  {photos.map((f, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 bg-white rounded-xl px-3 py-2 border border-slate-100 shadow-sm">
                      <span className="text-xs text-slate-700 truncate flex-1">{f.name}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                        aria-label={`Remove ${f.name}`}
                        className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400 rounded"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
                {photos.length < 10 && (
                  <p className="text-xs text-slate-400">Click to add more ({10 - photos.length} remaining)</p>
                )}
              </div>
            ) : (
              <div>
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-slate-700 mb-1">
                  {isDragging ? 'Drop your photos here' : 'Drag your damage photos here'}
                </p>
                <p className="text-slate-400 text-sm mb-4">or click to choose files</p>
                <span aria-hidden="true" className="inline-block bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
                  Choose photos
                </span>
                <p className="text-xs text-slate-400 mt-4">JPG, PNG, or WebP · Max 5MB each · Up to 10 photos</p>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              multiple
              aria-label="Choose damage photos"
              className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
          </div>

          {photoError && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex gap-2 items-start">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {photoError}
            </div>
          )}

          <button
            onClick={analyzePhotos}
            disabled={photos.length === 0 || isAnalyzing}
            className="w-full bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg shadow-md hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 min-h-[52px]"
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing your photos…
              </>
            ) : (
              <>
                Identify damaged items
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>

          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {isAnalyzing ? 'Analyzing your photos, please wait.' : ''}
          </div>

          {isAnalyzing && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700 text-center">
              This may take 20–40 seconds depending on the number of photos.
            </div>
          )}

          {analysisError && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex gap-2 items-start">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p>{analysisError}</p>
                <button
                  onClick={analyzePhotos}
                  className="mt-1 text-red-600 hover:text-red-800 font-semibold underline text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400 rounded"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Results table */}
          {inventoryItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">
                  {inventoryItems.length} item{inventoryItems.length !== 1 ? 's' : ''} identified
                </h3>
                <button
                  onClick={() => downloadCSV(inventoryItems)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-2 py-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download CSV
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" aria-label="Damage inventory">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th scope="col" className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Item</th>
                        <th scope="col" className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Room</th>
                        <th scope="col" className="text-right px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Est. Value</th>
                        <th scope="col" className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Condition</th>
                        <th scope="col" className="text-left px-4 py-3 font-semibold text-slate-600">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {inventoryItems.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-900">{item.item}</td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{item.room}</td>
                          <td className="px-4 py-3 text-right font-mono text-slate-900 whitespace-nowrap">
                            ${Number(item.estimatedValue).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                              item.condition === 'destroyed'
                                ? 'bg-red-100 text-red-700'
                                : item.condition === 'heavily damaged'
                                ? 'bg-orange-100 text-orange-700'
                                : item.condition === 'water damaged'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {item.condition}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs leading-relaxed">{item.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-100">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 font-bold text-slate-700">Total estimated value</td>
                        <td className="px-4 py-3 text-right font-bold font-mono text-slate-900">
                          ${inventoryItems.reduce((sum, i) => sum + Number(i.estimatedValue), 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Save to case */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                <h3 className="font-bold text-slate-900">Save to my case</h3>
                <div>
                  <label htmlFor="case-id-input" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Case ID <span className="text-slate-400 font-normal">(optional — from your results page)</span>
                  </label>
                  <input
                    id="case-id-input"
                    type="text"
                    value={caseId}
                    onChange={(e) => setCaseId(e.target.value)}
                    placeholder="e.g. 3f8a1b2c-..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                  />
                </div>

                {saveError && (
                  <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                    {saveError}
                  </div>
                )}

                {saved ? (
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Saved to your case
                  </div>
                ) : (
                  <button
                    onClick={saveInventory}
                    disabled={isSaving}
                    className="w-full bg-emerald-600 text-white py-3.5 rounded-2xl font-bold shadow-sm hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 min-h-[48px]"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Saving…
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Save to my case
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        <footer className="pb-8 pt-2">
          <p className="text-center text-xs text-slate-400 leading-relaxed">
            ClaimBack does not provide legal advice. Photo documentation is for your personal claim records.
          </p>
        </footer>
      </div>
    </main>
  );
}

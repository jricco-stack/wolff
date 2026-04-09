'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Upload', path: '/upload' },
  { label: 'My Documents', path: '/tracker' },
  { label: 'Emergency', path: '/emergency' },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white shadow-sm border-b border-slate-200'
            : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1E3A5F] to-[#2563EB] flex items-center justify-center">
<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="text-lg font-extrabold text-[#0F172A] tracking-tight">
                Claim<span className="text-[#2563EB]">Back</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-0.5" aria-label="Site navigation">
              {navLinks.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-[#2563EB]/10 text-[#2563EB] font-semibold'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/apply"
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isActive('/apply')
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300'
                }`}
              >
                First-time applicant?
              </Link>
              <Link
                href="/upload"
                className="inline-flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg px-4 py-2 font-semibold text-sm shadow-sm hover:shadow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Start Your Appeal
              </Link>
            </div>

            <button
              type="button"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`fixed top-16 left-0 right-0 z-50 bg-white border-b border-slate-100 shadow-lg md:hidden transition-all duration-200 ${
          mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col gap-1 p-4" aria-label="Mobile site navigation">
          {navLinks.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-[#2563EB]/10 text-[#2563EB] font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/apply"
              className={`px-4 py-2.5 rounded-xl text-sm font-medium text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive('/apply')
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              First-time applicant?
            </Link>
            <Link
              href="/upload"
              className="flex items-center justify-center bg-[#2563EB] text-white rounded-xl py-3 font-semibold text-sm transition-colors hover:bg-[#1D4ED8]"
            >
              Start Your Appeal
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}

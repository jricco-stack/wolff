import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Hero */}
      <div className="bg-blue-900 text-white px-4 pt-12 pb-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-5xl mb-4">🏠</div>
          <h1 className="text-3xl font-extrabold mb-3 leading-tight">
            AppealKit
          </h1>
          <p className="text-blue-200 text-lg mb-2">
            FEMA denied your application.
          </p>
          <p className="text-white font-semibold text-xl mb-8">
            You have the right to appeal — and we&apos;ll help you do it.
          </p>
          <Link
            href="/upload"
            className="inline-block bg-white text-blue-900 font-extrabold text-lg px-8 py-4 rounded-xl shadow-lg hover:bg-blue-50 transition"
          >
            Start your appeal →
          </Link>
          <p className="text-blue-300 text-sm mt-4">Free · Takes about 5 minutes</p>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-8">How AppealKit works</h2>
        <div className="space-y-6">
          {[
            {
              step: '1',
              icon: '📄',
              title: 'Upload your letter',
              desc: 'Take a photo or scan of the denial letter FEMA sent you.',
            },
            {
              step: '2',
              icon: '🔍',
              title: 'We read it for you',
              desc: 'We explain what the denial means, your deadline, and exactly what documents to gather.',
            },
            {
              step: '3',
              icon: '✉️',
              title: 'Get your appeal letter',
              desc: 'We write a complete, professional appeal letter you can edit and mail today.',
            },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold text-lg">
                {step}
              </div>
              <div>
                <div className="text-xl mb-1">{icon} <span className="font-bold text-gray-900">{title}</span></div>
                <p className="text-gray-600 text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Important info */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h3 className="font-bold text-amber-900 mb-2">Important deadlines</h3>
          <p className="text-amber-800 text-sm leading-relaxed">
            You have <strong>60 days</strong> from the date on your FEMA determination letter to submit an appeal.
            After that, you may lose your right to appeal. Don&apos;t wait.
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-2xl mx-auto px-4 pb-12 w-full">
        <Link
          href="/upload"
          className="block w-full bg-blue-700 text-white py-4 rounded-xl font-bold text-lg text-center hover:bg-blue-800 transition"
        >
          Upload my FEMA letter →
        </Link>
      </div>

      {/* Disclaimer */}
      <footer className="border-t border-gray-100 py-6 px-4">
        <p className="text-center text-xs text-gray-400 max-w-lg mx-auto">
          AppealKit is a free tool to help disaster survivors understand their rights.
          It does not provide legal advice. For legal assistance, contact your local legal aid organization
          or call 1-800-621-3362 (FEMA helpline).
        </p>
      </footer>
    </main>
  );
}

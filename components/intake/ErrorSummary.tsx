/**
 * @file components/intake/ErrorSummary.tsx
 * @description Single responsibility: Accessible WCAG 2.2 AA error summary alert with direct anchor links to invalid fields.
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorSummaryProps {
  errors: Record<string, string>;
  summaryRef: React.RefObject<HTMLDivElement | null>;
}

export const ErrorSummary: React.FC<ErrorSummaryProps> = ({ errors, summaryRef }) => {
  const errorCount = Object.keys(errors).length;
  if (errorCount === 0) return null;

  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      role="alert"
      aria-labelledby="error-summary-title"
      className="p-5 mb-8 rounded-2xl border-2 border-rose-500 bg-rose-950/80 text-rose-100 shadow-xl focus:outline-none focus:ring-4 focus:ring-rose-400"
    >
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="w-5 h-5 text-rose-300" aria-hidden="true" />
        <h3 id="error-summary-title" className="font-bold text-sm text-white">
          Please resolve the {errorCount} error{errorCount > 1 ? 's' : ''} below:
        </h3>
      </div>
      <ul className="list-disc list-inside space-y-1 text-xs text-rose-200">
        {Object.entries(errors).map(([field, msg]) => (
          <li key={field}>
            <a
              href={`#${field}`}
              className="underline hover:text-white font-medium focus:outline-none focus:ring-2 focus:ring-white rounded px-1"
            >
              {msg}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * @file components/tabs/vendors/VendorTipsBanner.tsx
 * @description Strategy tips callout for sourcing and vetting event vendors.
 */

import React from 'react';

interface VendorTipsBannerProps {
  tips: readonly string[];
}

export const VendorTipsBanner: React.FC<VendorTipsBannerProps> = ({ tips }) => {
  if (tips.length === 0) return null;

  return (
    <div className="p-4 rounded-2xl bg-[var(--surface-2)]/60 border border-[var(--royal)]/30">
      <h4 className="text-xs font-bold text-[var(--cyan)] uppercase tracking-wider mb-2">
        Pro Vendor Sourcing Strategy
      </h4>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[var(--text)]">
        {tips.map((tip, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-[var(--gold)] font-bold">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

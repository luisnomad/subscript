import { type ReactElement } from 'react';

export function AboutSettings(): ReactElement {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-display text-lg font-semibold text-[#2a2a2a]">
          About SubScript
        </h3>
        <p className="text-sm text-[#6b6b6b]">
          Information about the application.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-4">
          <span className="text-sm font-medium text-[#2a2a2a]">Version</span>
          <span className="font-mono text-sm text-[#6b6b6b]">0.1.0-alpha</span>
        </div>

        <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-4">
          <span className="text-sm font-medium text-[#2a2a2a]">Build</span>
          <span className="font-mono text-sm text-[#6b6b6b]">2024.05.24.1</span>
        </div>

        <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-4">
          <span className="text-sm font-medium text-[#2a2a2a]">License</span>
          <span className="text-sm text-[#6b6b6b]">MIT License</span>
        </div>

        <div className="pt-4">
          <p className="text-xs leading-relaxed text-[#9b9b9b]">
            SubScript is a financial editorial tool designed to help you manage your digital footprint. 
            It uses local LLMs and secure IMAP connections to automate the tracking of your subscriptions and domains.
          </p>
        </div>
      </div>
    </div>
  );
}

import { Phone, X } from 'lucide-react';
import type { PromoBannerConfig } from '../types';

interface PromoBannerProps {
  promo: PromoBannerConfig;
  dismissed: boolean;
  onDismiss: () => void;
}

export function PromoBanner({ promo, dismissed, onDismiss }: PromoBannerProps) {
  if (!promo.enabled || dismissed) return null;

  return (
    <div className="bg-[#141413] text-[#FAF9F6] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 min-w-0 truncate">
          <span className="truncate font-medium tracking-wide">{promo.message}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={`tel:${promo.orderPhone}`}
            className="hidden sm:inline-flex items-center gap-1.5 font-mono tabular-nums text-white hover:text-white/80 underline underline-offset-4 whitespace-nowrap shrink-0"
          >
            <Phone className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{promo.orderPhone}</span>
          </a>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Fermer la bannière promotionnelle"
            className="p-1.5 text-[#FAF9F6]/70 hover:text-white transition-colors rounded focus-visible:outline-2 focus-visible:outline-white"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

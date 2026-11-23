import { ShoppingBag } from 'lucide-react';
import type { BookCondition } from '../types';

interface TopBarProps {
  cartCount: number;
  onOpenCart: () => void;
  onSelectConditionFilter: (condition: 'Tous' | BookCondition) => void;
}

export function TopBar({ cartCount, onOpenCart, onSelectConditionFilter }: TopBarProps) {
  const handleFilterNav = (condition: 'Tous' | BookCondition) => {
    onSelectConditionFilter(condition);
    const el = document.getElementById('catalogue');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F6]/95 backdrop-blur-sm border-b border-[#E4E1D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        <a
          href="#accueil"
          className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-[#141413] whitespace-nowrap shrink-0"
        >
          READY TO READ
        </a>

        <nav
          aria-label="Navigation principale"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-[#52524E]"
        >
          <button
            type="button"
            onClick={() => handleFilterNav('Tous')}
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Catalogue
          </button>
          <button
            type="button"
            onClick={() => handleFilterNav('Neuf')}
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Livres Neufs
          </button>
          <button
            type="button"
            onClick={() => handleFilterNav('Usé')}
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Occasions
          </button>
          <a
            href="#service-client"
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Service Client
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-[#141413] text-[#FAF9F6] rounded-lg hover:bg-[#1E3A8A] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
          >
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            <span>Panier</span>
            <span className="font-mono tabular-nums">({cartCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
}

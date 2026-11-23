import { useState } from 'react';
import { ArrowRight, BookOpen, Check, Copy, Phone } from 'lucide-react';

interface StorefrontHeroProps {
  orderPhone: string;
  onExploreCatalog: () => void;
}

export function StorefrontHero({ orderPhone, onExploreCatalog }: StorefrontHeroProps) {
  const [copied, setCopied] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(orderPhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable in restricted contexts
    }
  };

  return (
    <section id="accueil" className="border-b border-[#E4E1D8] bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between py-2">
            <div>
              <p className="text-xs font-medium tracking-wider uppercase text-[#52524E] mb-4">
                Librairie indépendante · Livres neufs &amp; d’occasion vérifiés
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-[#141413] leading-[1.1] max-w-xl">
                Des ouvrages choisis avec soin, prêts pour votre prochaine lecture.
              </h1>
              <p className="mt-5 text-base sm:text-lg text-[#52524E] leading-relaxed max-w-lg">
                READY TO READ réunit des éditions neuves sous blister et des livres usés contrôlés
                page par page. Commandez en quelques clics ou directement par téléphone.
              </p>
            </div>

            <div className="mt-8 space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onExploreCatalog}
                  className="inline-flex items-center gap-2.5 px-6 py-3 text-sm font-medium bg-[#1E3A8A] text-white rounded-lg hover:bg-[#172554] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
                >
                  <span>Explorer le catalogue</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>

                <a
                  href={`tel:${orderPhone}`}
                  className="inline-flex items-center gap-2.5 px-5 py-3 text-sm font-medium bg-white text-[#141413] border border-[#D6D3C9] rounded-lg hover:border-[#141413] transition-colors whitespace-nowrap shrink-0"
                >
                  <Phone className="w-4 h-4 text-[#1E3A8A]" aria-hidden="true" />
                  <span>Commander :</span>
                  <span className="font-mono font-semibold tabular-nums">{orderPhone}</span>
                </a>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#52524E]">
                <span>Ligne directe commandes &amp; conseils :</span>
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="inline-flex items-center gap-1.5 font-mono font-medium text-[#141413] hover:text-[#1E3A8A] underline underline-offset-4 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#166534]" aria-hidden="true" />
                      <span>Numéro copié ({orderPhone})</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Copier le {orderPhone}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative h-full min-h-[280px] lg:min-h-[420px] rounded-xl overflow-hidden bg-[#F2F0EB] border border-[#E4E1D8]">
              {!imgFailed ? (
                <img
                  src="/src/assets/images/hero_bookstore_table_1795460408282.jpg"
                  alt="Table de présentation READY TO READ réunissant livres neufs reliés et romans d'occasion"
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="w-full h-full lg:h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#F2F0EB] text-[#52524E]">
                  <BookOpen className="w-10 h-10 mb-3 text-[#1E3A8A]" aria-hidden="true" />
                  <p className="font-display text-lg text-[#141413]">READY TO READ</p>
                  <p className="text-sm mt-1">Librairie de livres neufs et d’occasion</p>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/75 via-black/35 to-transparent text-white">
                <p className="text-xs font-medium tracking-wide text-white/85">
                  Sélection permanente · Neuf &amp; Seconde main
                </p>
                <p className="text-sm font-medium mt-0.5">
                  Expédition sous 48h ou confirmation immédiate au {orderPhone}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#E4E1D8] grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm font-semibold text-[#141413]">Occasions inspectées</p>
            <p className="text-xs text-[#52524E] mt-1 leading-relaxed">
              Chaque livre usé est contrôlé : reliure, pages complètes et propreté garanties.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#141413]">Remise multi-titres</p>
            <p className="text-xs text-[#52524E] mt-1 leading-relaxed">
              Réduction automatique de 20% appliquée au panier dès 3 livres d’occasion.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#141413]">Commande téléphonique</p>
            <p className="text-xs text-[#52524E] mt-1 leading-relaxed">
              Appelez le <span className="font-mono tabular-nums text-[#141413]">{orderPhone}</span> pour réserver ou commander sans compte.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#141413]">Paiement à la livraison</p>
            <p className="text-xs text-[#52524E] mt-1 leading-relaxed">
              Livraison offerte dès 35,00 € d’achats, règlement simple à la réception.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

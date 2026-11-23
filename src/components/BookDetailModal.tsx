import { useState } from 'react';
import { BookOpen, Phone, Plus, X } from 'lucide-react';
import type { Book } from '../types';

interface BookDetailModalProps {
  book: Book | null;
  orderPhone: string;
  onClose: () => void;
  onAddToCart: (book: Book) => void;
}

export function BookDetailModal({
  book,
  orderPhone,
  onClose,
  onAddToCart,
}: BookDetailModalProps) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!book) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-[#FAF9F6] border border-[#E4E1D8] rounded-xl overflow-hidden shadow-xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E1D8] bg-white">
          <p className="text-xs font-medium text-[#52524E]">
            {book.genre} <span aria-hidden="true">·</span> {book.conditionDetail}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fiche du livre"
            className="p-2 text-[#52524E] hover:text-[#141413] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5">
            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-[#F2F0EB] border border-[#E4E1D8]">
              {!imgFailed ? (
                <img
                  src={book.imageUrl}
                  alt={book.title}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-[#52524E]">
                  <BookOpen className="w-8 h-8 mb-2 text-[#1E3A8A]" aria-hidden="true" />
                  <span className="text-xs font-medium">{book.title}</span>
                </div>
              )}
            </div>

            <dl className="mt-4 pt-4 border-t border-[#E4E1D8] space-y-2 text-xs">
              <div className="flex justify-between gap-4">
                <dt className="text-[#52524E]">Éditeur</dt>
                <dd className="font-medium text-[#141413] text-right">{book.publisher}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#52524E]">Année / Pages</dt>
                <dd className="font-mono tabular-nums text-[#141413]">
                  {book.year} · {book.pages} p.
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#52524E]">ISBN</dt>
                <dd className="font-mono tabular-nums text-[#141413]">{book.isbn}</dd>
              </div>
            </dl>
          </div>

          <div className="md:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <p className="text-xs font-medium text-[#1E3A8A]">{book.author}</p>
              <h2
                id="book-modal-title"
                className="font-display text-2xl sm:text-3xl font-semibold text-[#141413] mt-1 leading-tight"
              >
                {book.title}
              </h2>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-mono text-2xl font-semibold tabular-nums text-[#141413]">
                  {book.price.toFixed(2)} €
                </span>
                {book.originalPrice && (
                  <span className="font-mono text-sm tabular-nums text-[#52524E] line-through">
                    {book.originalPrice.toFixed(2)} € neuf
                  </span>
                )}
                <span className="text-xs text-[#52524E]">
                  · {book.stock > 0 ? `${book.stock} exemplaire(s) en stock` : 'Rupture momentanée'}
                </span>
              </div>

              <p className="mt-4 text-sm text-[#52524E] leading-relaxed">{book.description}</p>
            </div>

            <div className="pt-4 border-t border-[#E4E1D8] space-y-3">
              <button
                type="button"
                disabled={book.stock <= 0}
                onClick={() => {
                  onAddToCart(book);
                  onClose();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium bg-[#141413] text-white rounded-lg hover:bg-[#1E3A8A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>{book.stock > 0 ? 'Ajouter au panier' : 'Indisponible'}</span>
              </button>

              <a
                href={`tel:${orderPhone}`}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-medium bg-white text-[#141413] border border-[#D6D3C9] rounded-lg hover:border-[#141413] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#1E3A8A]" aria-hidden="true" />
                <span>Commander par téléphone au {orderPhone}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

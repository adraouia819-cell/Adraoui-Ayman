import { useMemo, useState } from 'react';
import { BookOpen, Plus, Search } from 'lucide-react';
import type { Book, BookCondition, BookGenre } from '../types';

interface BookCatalogProps {
  books: Book[];
  conditionFilter: 'Tous' | BookCondition;
  onConditionFilterChange: (condition: 'Tous' | BookCondition) => void;
  onAddToCart: (book: Book) => void;
  onSelectBook: (book: Book) => void;
}

const GENRES: ('Tous les genres' | BookGenre)[] = [
  'Tous les genres',
  'Littérature',
  'Essais & Histoire',
  'Polars & Suspense',
  'Art & Architecture',
  'Jeunesse',
];

function BookCardImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#F2F0EB] text-[#52524E]">
        <BookOpen className="w-8 h-8 mb-2 text-[#1E3A8A]" aria-hidden="true" />
        <span className="text-xs font-medium line-clamp-2">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
    />
  );
}

export function BookCatalog({
  books,
  conditionFilter,
  onConditionFilterChange,
  onAddToCart,
  onSelectBook,
}: BookCatalogProps) {
  const [query, setQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState<'Tous les genres' | BookGenre>('Tous les genres');

  const filteredBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return books.filter((book) => {
      if (conditionFilter !== 'Tous' && book.condition !== conditionFilter) return false;
      if (genreFilter !== 'Tous les genres' && book.genre !== genreFilter) return false;
      if (!q) return true;
      return (
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.isbn.toLowerCase().includes(q)
      );
    });
  }, [books, conditionFilter, genreFilter, query]);

  return (
    <section id="catalogue" className="py-14 lg:py-20 bg-[#FAF9F6] border-b border-[#E4E1D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E4E1D8]">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#52524E]">
              Catalogue READY TO READ
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#141413] mt-1">
              Sélection de livres neufs &amp; d’occasion
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search
                className="w-4 h-4 text-[#52524E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Titre, auteur ou ISBN..."
                aria-label="Rechercher un livre par titre, auteur ou ISBN"
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 text-sm bg-white border border-[#D6D3C9] rounded-lg text-[#141413] placeholder:text-[#78756E] focus:outline-none focus:border-[#1E3A8A]"
              />
            </div>

            <div
              role="group"
              aria-label="Filtrer par état du livre"
              className="inline-flex items-center p-1 bg-[#EDEAE2] rounded-lg shrink-0"
            >
              {(['Tous', 'Neuf', 'Usé'] as const).map((cond) => {
                const active = conditionFilter === cond;
                const label = cond === 'Usé' ? 'Occasion / Usé' : cond;
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => onConditionFilterChange(cond)}
                    className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-white text-[#141413] shadow-xs'
                        : 'text-[#52524E] hover:text-[#141413]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 py-5">
          {GENRES.map((genre) => {
            const active = genreFilter === genre;
            return (
              <button
                key={genre}
                type="button"
                onClick={() => setGenreFilter(genre)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#141413] text-white border-[#141413]'
                    : 'bg-white text-[#52524E] border-[#E4E1D8] hover:border-[#141413] hover:text-[#141413]'
                }`}
              >
                {genre}
              </button>
            );
          })}
          <span className="ml-auto text-xs text-[#52524E] font-mono tabular-nums">
            {filteredBooks.length} titre{filteredBooks.length > 1 ? 's' : ''}
          </span>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="py-16 text-center bg-white border border-[#E4E1D8] rounded-xl">
            <p className="font-display text-xl text-[#141413]">Aucun ouvrage ne correspond à votre recherche</p>
            <p className="text-sm text-[#52524E] mt-2">
              Essayez un autre mot-clé ou réinitialisez les filtres pour parcourir tout le rayon.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setGenreFilter('Tous les genres');
                onConditionFilterChange('Tous');
              }}
              className="mt-5 px-4 py-2 text-xs font-medium bg-[#141413] text-white rounded-lg hover:bg-[#1E3A8A] transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBooks.map((book) => (
              <article
                key={book.id}
                className="group bg-white border border-[#E4E1D8] rounded-xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => onSelectBook(book)}
                  className="aspect-[4/3] w-full bg-[#F2F0EB] overflow-hidden text-left focus-visible:outline-2 focus-visible:outline-[#1E3A8A]"
                >
                  <BookCardImage src={book.imageUrl} alt={book.title} />
                </button>

                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-xs text-[#52524E] truncate">
                    <span className="font-medium text-[#1E3A8A]">{book.condition}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{book.conditionDetail.replace(/^Neuf · |^Occasion · /, '')}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{book.genre}</span>
                  </p>

                  <button
                    type="button"
                    onClick={() => onSelectBook(book)}
                    className="mt-2 text-left focus-visible:outline-2 focus-visible:outline-[#1E3A8A] rounded"
                  >
                    <h3 className="text-base font-semibold text-[#141413] group-hover:text-[#1E3A8A] transition-colors line-clamp-2">
                      {book.title}
                    </h3>
                  </button>
                  <p className="text-sm text-[#52524E] mt-1">{book.author}</p>

                  <div className="mt-auto pt-4 flex items-center justify-between gap-4 border-t border-[#F0EDE6]">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-base font-semibold tabular-nums text-[#141413]">
                          {book.price.toFixed(2)} €
                        </span>
                        {book.originalPrice && (
                          <span className="font-mono text-xs tabular-nums text-[#78756E] line-through">
                            {book.originalPrice.toFixed(2)} €
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#52524E] font-mono tabular-nums mt-0.5">
                        {book.stock > 0 ? `Stock : ${book.stock}` : 'Épuisé'}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={book.stock <= 0}
                      onClick={() => onAddToCart(book)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium bg-[#141413] text-white rounded-lg hover:bg-[#1E3A8A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{book.stock > 0 ? 'Ajouter' : 'Épuisé'}</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

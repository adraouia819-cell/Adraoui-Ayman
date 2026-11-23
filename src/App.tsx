import { useEffect, useState } from 'react';
import { Phone } from 'lucide-react';
import { BookCatalog } from './components/BookCatalog';
import { BookDetailModal } from './components/BookDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CustomerServiceSection } from './components/CustomerServiceSection';
import { PromoBanner } from './components/PromoBanner';
import { StorefrontHero } from './components/StorefrontHero';
import { TopBar } from './components/TopBar';
import type { Book, BookCondition, CartItem, Order, PromoBannerConfig } from './types';

const DEFAULT_PROMO: PromoBannerConfig = {
  enabled: true,
  message:
    "Offre de bienvenue READY TO READ : -20% sur les livres d'occasion dès 3 titres · Commande directe au 0675215000",
  discountPercent: 20,
  minUsedBooks: 3,
  orderPhone: '0675215000',
};

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [promo, setPromo] = useState<PromoBannerConfig>(DEFAULT_PROMO);
  const [orderPhone, setOrderPhone] = useState('0675215000');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [conditionFilter, setConditionFilter] = useState<'Tous' | BookCondition>('Tous');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    let active = true;
    fetch('/api/store')
      .then((res) => {
        if (!res.ok) throw new Error('Erreur de chargement');
        return res.json();
      })
      .then((data: { books: Book[]; promo: PromoBannerConfig; orderPhone: string }) => {
        if (!active) return;
        setBooks(data.books);
        setPromo(data.promo);
        setOrderPhone(data.orderPhone || '0675215000');
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoadError('Impossible de charger le catalogue pour le moment.');
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleAddToCart = (book: Book) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.book.id === book.id);
      if (existing) {
        return prev.map((i) =>
          i.book.id === book.id
            ? { ...i, quantity: Math.min(book.stock, i.quantity + 1) }
            : i,
        );
      }
      return [...prev, { book, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const handleUpdateQuantity = (bookId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.book.id === bookId
            ? { ...item, quantity: Math.min(item.book.stock, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemoveItem = (bookId: string) => {
    setCartItems((prev) => prev.filter((item) => item.book.id !== bookId));
  };

  const handleOrderCompleted = (_order: Order, updatedBooks: Book[]) => {
    setBooks(updatedBooks);
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#141413]">
      <PromoBanner
        promo={promo}
        dismissed={bannerDismissed}
        onDismiss={() => setBannerDismissed(true)}
      />

      <TopBar
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        onSelectConditionFilter={setConditionFilter}
      />

      <main className="flex-1">
        <StorefrontHero
          orderPhone={orderPhone}
          onExploreCatalog={() => {
            const el = document.getElementById('catalogue');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {loading ? (
          <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-[#52524E]">
            Chargement du catalogue READY TO READ...
          </section>
        ) : loadError ? (
          <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-[#991B1B]">
            {loadError}
          </section>
        ) : (
          <BookCatalog
            books={books}
            conditionFilter={conditionFilter}
            onConditionFilterChange={setConditionFilter}
            onAddToCart={handleAddToCart}
            onSelectBook={setSelectedBook}
          />
        )}

        <CustomerServiceSection
          orderPhone={orderPhone}
          books={books}
          promo={promo}
          onBooksUpdated={(nextBooks) => {
            setBooks(nextBooks);
            setCartItems((prev) =>
              prev
                .map((item) => {
                  const latest = nextBooks.find((b) => b.id === item.book.id);
                  return latest ? { book: latest, quantity: Math.min(latest.stock, item.quantity) } : null;
                })
                .filter((x): x is CartItem => x !== null && x.quantity > 0),
            );
          }}
          onPromoUpdated={(nextPromo) => {
            setPromo(nextPromo);
            if (nextPromo.enabled) setBannerDismissed(false);
          }}
        />
      </main>

      <footer className="bg-[#141413] text-[#FAF9F6] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="font-display text-lg font-semibold tracking-tight">READY TO READ</p>
            <p className="text-xs text-[#FAF9F6]/70 mt-1">
              Librairie de livres neufs et d’occasion · Expédition rapide &amp; paiement à la
              réception.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#FAF9F6]/80">
            <a
              href={`tel:${orderPhone}`}
              className="inline-flex items-center gap-2 font-mono font-medium text-white hover:underline underline-offset-4"
            >
              <Phone className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Commandes : {orderPhone}</span>
            </a>
            <a href="#catalogue" className="hover:text-white transition-colors">
              Catalogue
            </a>
            <a href="#service-client" className="hover:text-white transition-colors">
              Service Client &amp; Admin
            </a>
            <span className="text-[#FAF9F6]/50">© {new Date().getFullYear()} READY TO READ</span>
          </div>
        </div>
      </footer>

      <BookDetailModal
        book={selectedBook}
        orderPhone={orderPhone}
        onClose={() => setSelectedBook(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        open={cartOpen}
        items={cartItems}
        promo={promo}
        orderPhone={orderPhone}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOrderCompleted={handleOrderCompleted}
      />
    </div>
  );
}

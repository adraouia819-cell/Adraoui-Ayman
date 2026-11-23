import { useState, type FormEvent } from 'react';
import { CheckCircle2, Minus, Phone, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import type { Book, CartItem, Order, PromoBannerConfig } from '../types';

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  promo: PromoBannerConfig;
  orderPhone: string;
  onClose: () => void;
  onUpdateQuantity: (bookId: string, delta: number) => void;
  onRemoveItem: (bookId: string) => void;
  onOrderCompleted: (order: Order, updatedBooks: Book[]) => void;
}

export function CartDrawer({
  open,
  items,
  promo,
  orderPhone,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onOrderCompleted,
}: CartDrawerProps) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (!open) return null;

  const subtotal = items.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
  const usedCount = items
    .filter((i) => i.book.condition === 'Usé')
    .reduce((sum, i) => sum + i.quantity, 0);
  const usedSubtotal = items
    .filter((i) => i.book.condition === 'Usé')
    .reduce((sum, i) => sum + i.book.price * i.quantity, 0);

  const qualifiesPromo =
    promo.enabled && promo.discountPercent > 0 && usedCount >= promo.minUsedBooks;
  const discountAmount = qualifiesPromo
    ? Math.round(usedSubtotal * (promo.discountPercent / 100) * 100) / 100
    : 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const shippingFee = items.length === 0 ? 0 : discountedSubtotal >= 35 ? 0 : 3.5;
  const total = Math.round((discountedSubtotal + shippingFee) * 100) / 100;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          phone,
          address,
          city,
          postalCode,
          notes,
          items: items.map((i) => ({ bookId: i.book.id, quantity: i.quantity })),
        }),
      });
      const data = (await res.json()) as { order?: Order; books?: Book[]; error?: string };
      if (!res.ok || !data.order || !data.books) {
        setError(data.error || "Impossible d'enregistrer votre commande.");
        return;
      }
      setConfirmedOrder(data.order);
      onOrderCompleted(data.order, data.books);
      setCustomerName('');
      setPhone('');
      setAddress('');
      setCity('');
      setPostalCode('');
      setNotes('');
    } catch {
      setError('Erreur réseau lors de la validation de la commande.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Panier et validation de commande"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#FAF9F6] h-full flex flex-col border-l border-[#E4E1D8] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-white border-b border-[#E4E1D8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-[#1E3A8A]" aria-hidden="true" />
            <h2 className="font-display text-lg font-semibold text-[#141413]">
              Votre Panier READY TO READ
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setConfirmedOrder(null);
              onClose();
            }}
            aria-label="Fermer le panier"
            className="p-2 text-[#52524E] hover:text-[#141413] rounded-lg"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {confirmedOrder ? (
            <div className="bg-white border border-[#E4E1D8] rounded-xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#166534] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-mono uppercase tracking-wide text-[#166534]">
                    Commande {confirmedOrder.id} enregistrée
                  </p>
                  <h3 className="font-display text-xl font-semibold text-[#141413] mt-1">
                    Merci {confirmedOrder.customerName}
                  </h3>
                  <p className="text-sm text-[#52524E] mt-1.5 leading-relaxed">
                    Notre équipe vous appellera très prochainement depuis le{' '}
                    <span className="font-mono font-semibold text-[#141413]">{orderPhone}</span> pour
                    confirmer votre créneau de livraison.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E4E1D8] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#52524E]">Statut</span>
                  <span className="font-medium text-[#141413]">{confirmedOrder.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#52524E]">Livraison</span>
                  <span className="font-medium text-[#141413]">
                    {confirmedOrder.address}, {confirmedOrder.postalCode} {confirmedOrder.city}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#52524E]">Total à régler à la réception</span>
                  <span className="font-mono font-semibold tabular-nums text-[#141413]">
                    {confirmedOrder.total.toFixed(2)} €
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setConfirmedOrder(null);
                  onClose();
                }}
                className="w-full py-2.5 text-sm font-medium bg-[#141413] text-white rounded-lg hover:bg-[#1E3A8A] transition-colors"
              >
                Continuer mes découvertes
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <p className="font-display text-xl text-[#141413]">Votre panier est vide</p>
              <p className="text-sm text-[#52524E] max-w-xs mx-auto">
                Ajoutez des livres neufs ou d’occasion au catalogue, ou commandez directement par
                téléphone au <span className="font-mono font-medium text-[#141413]">{orderPhone}</span>.
              </p>
              <a
                href={`tel:${orderPhone}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium bg-white border border-[#D6D3C9] text-[#141413] rounded-lg hover:border-[#141413]"
              >
                <Phone className="w-3.5 h-3.5 text-[#1E3A8A]" aria-hidden="true" />
                <span>Appeler le {orderPhone}</span>
              </a>
            </div>
          ) : (
            <>
              {promo.enabled && promo.discountPercent > 0 && (
                <div className="p-3.5 bg-white border border-[#E4E1D8] rounded-lg text-xs text-[#141413]">
                  {qualifiesPromo ? (
                    <span className="font-medium text-[#166534]">
                      Offre appliquée : -{promo.discountPercent}% sur vos {usedCount} livres
                      d’occasion (-{discountAmount.toFixed(2)} €).
                    </span>
                  ) : (
                    <span>
                      Astuce promo : ajoutez encore{' '}
                      <strong className="font-mono tabular-nums">
                        {promo.minUsedBooks - usedCount}
                      </strong>{' '}
                      livre(s) d’occasion pour bénéficier de -{promo.discountPercent}% sur vos
                      occasions.
                    </span>
                  )}
                </div>
              )}

              <ul className="divide-y divide-[#E4E1D8] bg-white border border-[#E4E1D8] rounded-xl px-4">
                {items.map(({ book, quantity }) => (
                  <li key={book.id} className="py-4 flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[#1E3A8A] font-medium">{book.condition}</p>
                      <p className="text-sm font-semibold text-[#141413] truncate">{book.title}</p>
                      <p className="text-xs text-[#52524E]">{book.author}</p>
                      <div className="mt-2.5 flex items-center gap-2">
                        <div className="inline-flex items-center border border-[#D6D3C9] rounded-md">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(book.id, -1)}
                            aria-label={`Réduire la quantité de ${book.title}`}
                            className="p-1.5 text-[#52524E] hover:text-[#141413]"
                          >
                            <Minus className="w-3 h-3" aria-hidden="true" />
                          </button>
                          <span className="px-2.5 text-xs font-mono tabular-nums text-[#141413]">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            disabled={quantity >= book.stock}
                            onClick={() => onUpdateQuantity(book.id, 1)}
                            aria-label={`Augmenter la quantité de ${book.title}`}
                            className="p-1.5 text-[#52524E] hover:text-[#141413] disabled:opacity-40"
                          >
                            <Plus className="w-3 h-3" aria-hidden="true" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(book.id)}
                          aria-label={`Retirer ${book.title} du panier`}
                          className="p-1.5 text-[#78756E] hover:text-[#B91C1C] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <p className="font-mono text-sm font-semibold tabular-nums text-[#141413] shrink-0">
                      {(book.price * quantity).toFixed(2)} €
                    </p>
                  </li>
                ))}
              </ul>

              <div className="bg-white border border-[#E4E1D8] rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-[#52524E]">
                  <span>Sous-total</span>
                  <span className="font-mono tabular-nums">{subtotal.toFixed(2)} €</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#166534]">
                    <span>Remise livres d’occasion (-{promo.discountPercent}%)</span>
                    <span className="font-mono tabular-nums">-{discountAmount.toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between text-[#52524E]">
                  <span>Livraison (offerte dès 35 €)</span>
                  <span className="font-mono tabular-nums">
                    {shippingFee === 0 ? 'Gratuite' : `${shippingFee.toFixed(2)} €`}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#E4E1D8] flex justify-between font-semibold text-[#141413]">
                  <span>Total (Paiement à la livraison)</span>
                  <span className="font-mono tabular-nums">{total.toFixed(2)} €</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="bg-white border border-[#E4E1D8] rounded-xl p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#141413]">
                    Coordonnées de livraison
                  </h3>
                  <p className="text-xs text-[#52524E] mt-0.5">
                    Confirmation par appel depuis le {orderPhone} avant expédition.
                  </p>
                </div>

                {error && (
                  <div className="p-3 text-xs text-[#991B1B] bg-[#FEF2F2] border border-[#FECACA] rounded-lg">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#52524E] mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ex. Nadia Alami"
                      className="w-full px-3 py-2 text-sm border border-[#D6D3C9] rounded-lg focus:outline-none focus:border-[#1E3A8A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#52524E] mb-1">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="06..."
                      className="w-full px-3 py-2 text-sm font-mono border border-[#D6D3C9] rounded-lg focus:outline-none focus:border-[#1E3A8A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#52524E] mb-1">
                    Adresse de livraison *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rue, numéro, appartement..."
                    className="w-full px-3 py-2 text-sm border border-[#D6D3C9] rounded-lg focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#52524E] mb-1">Ville *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#D6D3C9] rounded-lg focus:outline-none focus:border-[#1E3A8A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#52524E] mb-1">
                      Code postal *
                    </label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono border border-[#D6D3C9] rounded-lg focus:outline-none focus:border-[#1E3A8A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#52524E] mb-1">
                    Instructions (optionnel)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Créneau souhaité, digicode..."
                    className="w-full px-3 py-2 text-sm border border-[#D6D3C9] rounded-lg focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 text-sm font-medium bg-[#1E3A8A] text-white rounded-lg hover:bg-[#172554] disabled:opacity-50 transition-colors"
                >
                  {submitting
                    ? 'Enregistrement...'
                    : `Valider la commande (${total.toFixed(2)} €)`}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState, type FormEvent } from 'react';
import {
  CheckCircle2,
  KeyRound,
  LogOut,
  MessageSquare,
  Package,
  Phone,
  Plus,
  ShieldCheck,
  Tag,
  Trash2,
} from 'lucide-react';
import type {
  AdminStatusResponse,
  Book,
  BookCondition,
  BookConditionGrade,
  BookGenre,
  CustomerTicket,
  Order,
  OrderStatus,
  PromoBannerConfig,
  TicketStatus,
} from '../types';

interface CustomerServiceSectionProps {
  orderPhone: string;
  books: Book[];
  promo: PromoBannerConfig;
  onBooksUpdated: (books: Book[]) => void;
  onPromoUpdated: (promo: PromoBannerConfig) => void;
}

type AdminTab = 'commandes' | 'tickets' | 'catalogue' | 'promo';

const ORDER_STATUSES: OrderStatus[] = [
  'En attente de confirmation',
  'Confirmée par appel',
  'En préparation',
  'Expédiée',
  'Livrée',
  'Annulée',
];

const TICKET_STATUSES: TicketStatus[] = ['Nouveau', 'En cours', 'Résolu'];

const GENRES: BookGenre[] = [
  'Littérature',
  'Essais & Histoire',
  'Polars & Suspense',
  'Art & Architecture',
  'Jeunesse',
];

export function CustomerServiceSection({
  orderPhone,
  books,
  promo,
  onBooksUpdated,
  onPromoUpdated,
}: CustomerServiceSectionProps) {
  // Public Client Support Form State
  const [ticketName, setTicketName] = useState('');
  const [ticketPhone, setTicketPhone] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketOrderRef, setTicketOrderRef] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketError, setTicketError] = useState('');
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

  // Admin Auth State (Bearer token held strictly in React state memory)
  const [adminStatus, setAdminStatus] = useState<AdminStatusResponse | null>(null);
  const [loginInput, setLoginInput] = useState('admin');
  const [codeInput, setCodeInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminLoginName, setAdminLoginName] = useState<string>('');

  // Admin Dashboard Data State
  const [activeTab, setActiveTab] = useState<AdminTab>('commandes');
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<CustomerTicket[]>([]);
  const [adminNotice, setAdminNotice] = useState('');

  // Phone Order Modal/Inline Form inside Admin
  const [showPhoneOrderForm, setShowPhoneOrderForm] = useState(false);
  const [poName, setPoName] = useState('');
  const [poPhone, setPoPhone] = useState('');
  const [poAddress, setPoAddress] = useState('');
  const [poCity, setPoCity] = useState('');
  const [poBookId, setPoBookId] = useState('');
  const [poQuantity, setPoQuantity] = useState(1);

  // Add Book Form inside Admin
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newGenre, setNewGenre] = useState<BookGenre>('Littérature');
  const [newCondition, setNewCondition] = useState<BookCondition>('Usé');
  const [newGrade, setNewGrade] = useState<BookConditionGrade>('Occasion · Très bon état');
  const [newPrice, setNewPrice] = useState('9.50');
  const [newStock, setNewStock] = useState('3');
  const [newDescription, setNewDescription] = useState('');

  // Promo Form inside Admin
  const [promoEnabled, setPromoEnabled] = useState(promo.enabled);
  const [promoMessage, setPromoMessage] = useState(promo.message);
  const [promoPercent, setPromoPercent] = useState(String(promo.discountPercent));
  const [promoMinUsed, setPromoMinUsed] = useState(String(promo.minUsedBooks));

  useEffect(() => {
    setPromoEnabled(promo.enabled);
    setPromoMessage(promo.message);
    setPromoPercent(String(promo.discountPercent));
    setPromoMinUsed(String(promo.minUsedBooks));
  }, [promo]);

  useEffect(() => {
    let active = true;
    fetch('/api/admin/status')
      .then((res) => res.json())
      .then((data: AdminStatusResponse) => {
        if (!active) return;
        setAdminStatus(data);
        if (data.defaultLogin) setLoginInput(data.defaultLogin);
      })
      .catch(() => {
        if (active) setAdminStatus({ needsSetup: false, defaultLogin: 'admin' });
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (books.length > 0 && !poBookId) {
      setPoBookId(books[0].id);
    }
  }, [books, poBookId]);

  const loadDashboard = async (token: string) => {
    const res = await fetch('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      setAdminToken(null);
      return;
    }
    if (!res.ok) return;
    const data = (await res.json()) as {
      orders: Order[];
      tickets: CustomerTicket[];
      books: Book[];
      promo: PromoBannerConfig;
    };
    setOrders(data.orders);
    setTickets(data.tickets);
    onBooksUpdated(data.books);
    onPromoUpdated(data.promo);
  };

  const handleSubmitTicket = async (e: FormEvent) => {
    e.preventDefault();
    setTicketError('');
    setTicketSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: ticketName,
          phone: ticketPhone,
          email: ticketEmail,
          orderRef: ticketOrderRef,
          subject: ticketSubject,
          message: ticketMessage,
        }),
      });
      const data = (await res.json()) as { ticket?: CustomerTicket; error?: string };
      if (!res.ok || !data.ticket) {
        setTicketError(data.error || "Impossible d'envoyer votre demande.");
        return;
      }
      setCreatedTicketId(data.ticket.id);
      setTicketName('');
      setTicketPhone('');
      setTicketEmail('');
      setTicketOrderRef('');
      setTicketSubject('');
      setTicketMessage('');
      if (adminToken) {
        void loadDashboard(adminToken);
      }
    } catch {
      setTicketError('Erreur réseau lors de l’envoi de votre message.');
    } finally {
      setTicketSubmitting(false);
    }
  };

  const handleAdminAuth = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    const endpoint = adminStatus?.needsSetup ? '/api/admin/setup' : '/api/admin/login';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: loginInput,
          confirmationCode: codeInput,
        }),
      });
      const data = (await res.json()) as {
        token?: string;
        adminLogin?: string;
        error?: string;
      };
      if (!res.ok || !data.token) {
        setAuthError(data.error || 'Échec de connexion administrateur.');
        return;
      }
      setAdminToken(data.token);
      setAdminLoginName(data.adminLogin || loginInput);
      setCodeInput('');
      setAdminStatus({ needsSetup: false, defaultLogin: data.adminLogin || loginInput });
      await loadDashboard(data.token);
    } catch {
      setAuthError('Erreur réseau lors de la vérification.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleUpdateOrder = async (orderId: string, status: OrderStatus, agentNote?: string) => {
    if (!adminToken) return;
    const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status, agentNote }),
    });
    if (res.ok) {
      const data = (await res.json()) as { order: Order };
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      setAdminNotice(`Commande ${orderId} mise à jour.`);
    }
  };

  const handleCreatePhoneOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    const res = await fetch('/api/admin/orders/phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        customerName: poName,
        phone: poPhone,
        address: poAddress,
        city: poCity,
        bookId: poBookId,
        quantity: poQuantity,
      }),
    });
    const data = (await res.json()) as { order?: Order; books?: Book[]; error?: string };
    if (res.ok && data.order && data.books) {
      setOrders((prev) => [data.order!, ...prev]);
      onBooksUpdated(data.books);
      setShowPhoneOrderForm(false);
      setPoName('');
      setPoPhone('');
      setPoAddress('');
      setPoCity('');
      setPoQuantity(1);
      setAdminNotice(`Commande téléphonique ${data.order.id} enregistrée.`);
    } else {
      setAdminNotice(data.error || 'Erreur lors de la création.');
    }
  };

  const handleUpdateTicket = async (ticketId: string, status: TicketStatus, replyNote?: string) => {
    if (!adminToken) return;
    const res = await fetch(`/api/admin/tickets/${encodeURIComponent(ticketId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status, replyNote }),
    });
    if (res.ok) {
      const data = (await res.json()) as { ticket: CustomerTicket };
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? data.ticket : t)));
      setAdminNotice(`Demande ${ticketId} mise à jour.`);
    }
  };

  const handleAddBook = async (e: FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    const res = await fetch('/api/admin/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: newTitle,
        author: newAuthor,
        genre: newGenre,
        condition: newCondition,
        conditionDetail: newGrade,
        price: Number(newPrice),
        stock: Number(newStock),
        description: newDescription,
      }),
    });
    const data = (await res.json()) as { book?: Book; error?: string };
    if (res.ok && data.book) {
      onBooksUpdated([data.book, ...books]);
      setNewTitle('');
      setNewAuthor('');
      setNewDescription('');
      setAdminNotice(`Livre "${data.book.title}" ajouté au catalogue.`);
    } else {
      setAdminNotice(data.error || 'Impossible d’ajouter cet ouvrage.');
    }
  };

  const handleAdjustStock = async (book: Book, delta: number) => {
    if (!adminToken) return;
    const nextStock = Math.max(0, book.stock + delta);
    const res = await fetch(`/api/admin/books/${encodeURIComponent(book.id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ stock: nextStock }),
    });
    if (res.ok) {
      const data = (await res.json()) as { book: Book };
      onBooksUpdated(books.map((b) => (b.id === book.id ? data.book : b)));
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!adminToken) return;
    const res = await fetch(`/api/admin/books/${encodeURIComponent(bookId)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.ok) {
      onBooksUpdated(books.filter((b) => b.id !== bookId));
      setAdminNotice('Ouvrage retiré du catalogue.');
    }
  };

  const handleSavePromo = async (e: FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    const res = await fetch('/api/admin/promo', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        enabled: promoEnabled,
        message: promoMessage,
        discountPercent: Number(promoPercent),
        minUsedBooks: Number(promoMinUsed),
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as { promo: PromoBannerConfig };
      onPromoUpdated(data.promo);
      setAdminNotice('Bannière promotionnelle mise à jour.');
    }
  };

  const pendingOrdersCount = orders.filter((o) => o.status === 'En attente de confirmation').length;
  const openTicketsCount = tickets.filter((t) => t.status !== 'Résolu').length;

  return (
    <section id="service-client" className="py-14 lg:py-20 bg-[#F2F0EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#DCD8CD]">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#52524E]">
              Assistance &amp; Gestion
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#141413] mt-1">
              Service Client &amp; Administration
            </h2>
          </div>

          <a
            href={`tel:${orderPhone}`}
            className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-white border border-[#D6D3C9] rounded-lg text-sm font-medium text-[#141413] hover:border-[#141413] transition-colors self-start md:self-auto"
          >
            <Phone className="w-4 h-4 text-[#1E3A8A]" aria-hidden="true" />
            <span>Ligne commandes &amp; SAV :</span>
            <span className="font-mono font-semibold tabular-nums">{orderPhone}</span>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Customer Support Inquiry Form */}
          <div className="lg:col-span-5 bg-white border border-[#E4E1D8] rounded-xl p-6 space-y-5">
            <div>
              <h3 className="font-display text-xl font-semibold text-[#141413]">
                Contacter le service clients
              </h3>
              <p className="text-sm text-[#52524E] mt-1">
                Suivi de commande, recherche d’un livre rare ou demande de conseil : notre équipe
                vous répond sous 24h.
              </p>
            </div>

            {createdTicketId && (
              <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg flex items-start gap-3 text-xs text-[#166534]">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold">Demande {createdTicketId} enregistrée</p>
                  <p className="mt-0.5">
                    Un conseiller vous rappellera ou vous répondra très vite (ligne directe :{' '}
                    {orderPhone}).
                  </p>
                </div>
              </div>
            )}

            {ticketError && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-xs text-[#991B1B]">
                {ticketError}
              </div>
            )}

            <form onSubmit={handleSubmitTicket} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#52524E] mb-1">
                    Votre nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={ticketName}
                    onChange={(e) => setTicketName(e.target.value)}
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
                    value={ticketPhone}
                    onChange={(e) => setTicketPhone(e.target.value)}
                    placeholder="06..."
                    className="w-full px-3 py-2 text-sm font-mono border border-[#D6D3C9] rounded-lg focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#52524E] mb-1">Email</label>
                  <input
                    type="email"
                    value={ticketEmail}
                    onChange={(e) => setTicketEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="w-full px-3 py-2 text-sm border border-[#D6D3C9] rounded-lg focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#52524E] mb-1">
                    Réf. commande
                  </label>
                  <input
                    type="text"
                    value={ticketOrderRef}
                    onChange={(e) => setTicketOrderRef(e.target.value)}
                    placeholder="Ex. RTR-1042"
                    className="w-full px-3 py-2 text-sm font-mono border border-[#D6D3C9] rounded-lg focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#52524E] mb-1">Objet *</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Recherche de livre, modification livraison..."
                  className="w-full px-3 py-2 text-sm border border-[#D6D3C9] rounded-lg focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#52524E] mb-1">Message *</label>
                <textarea
                  required
                  rows={3}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Précisez votre demande..."
                  className="w-full px-3 py-2 text-sm border border-[#D6D3C9] rounded-lg focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>

              <button
                type="submit"
                disabled={ticketSubmitting}
                className="w-full py-2.5 text-sm font-medium bg-[#141413] text-white rounded-lg hover:bg-[#1E3A8A] disabled:opacity-50 transition-colors"
              >
                {ticketSubmitting ? 'Envoi en cours...' : 'Envoyer au service client'}
              </button>
            </form>
          </div>

          {/* Right Column: Customer Service Administration Portal */}
          <div className="lg:col-span-7 bg-white border border-[#E4E1D8] rounded-xl p-6 space-y-6">
            {!adminToken ? (
              <div className="max-w-md mx-auto py-4 space-y-5">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-[#F2F0EB] rounded-lg text-[#1E3A8A] shrink-0">
                    <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-[#141413]">
                      {adminStatus?.needsSetup
                        ? 'Initialiser l’accès Administration Service Clients'
                        : 'Administration Service Clients'}
                    </h3>
                    <p className="text-xs text-[#52524E] mt-1 leading-relaxed">
                      {adminStatus?.needsSetup
                        ? 'Première utilisation : définissez votre identifiant et votre code de confirmation administrateur pour sécuriser l’espace service clients.'
                        : 'Connectez-vous avec votre identifiant et votre code de confirmation pour gérer les commandes, demandes clients, stocks et promotions.'}
                    </p>
                  </div>
                </div>

                {authError && (
                  <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-xs text-[#991B1B]">
                    {authError}
                  </div>
                )}

                <form onSubmit={handleAdminAuth} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#52524E] mb-1">
                      Identifiant (Login)
                    </label>
                    <input
                      type="text"
                      required
                      value={loginInput}
                      onChange={(e) => setLoginInput(e.target.value)}
                      autoComplete="username"
                      className="w-full px-3.5 py-2.5 text-sm border border-[#D6D3C9] rounded-lg focus:outline-none focus:border-[#1E3A8A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#52524E] mb-1">
                      Code de confirmation
                    </label>
                    <div className="relative">
                      <KeyRound
                        className="w-4 h-4 text-[#78756E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        aria-hidden="true"
                      />
                      <input
                        type="password"
                        required
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value)}
                        placeholder="Saisir le code de confirmation"
                        autoComplete="current-password"
                        className="w-full pl-10 pr-4 py-2.5 text-sm font-mono border border-[#D6D3C9] rounded-lg focus:outline-none focus:border-[#1E3A8A]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2.5 text-sm font-medium bg-[#1E3A8A] text-white rounded-lg hover:bg-[#172554] disabled:opacity-50 transition-colors"
                  >
                    {authLoading
                      ? 'Vérification...'
                      : adminStatus?.needsSetup
                        ? 'Enregistrer et ouvrir l’administration'
                        : 'Accéder au service clients'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E4E1D8]">
                  <div>
                    <p className="text-xs text-[#52524E]">
                      Session active · <span className="font-mono font-medium text-[#141413]">{adminLoginName}</span>
                    </p>
                    <h3 className="font-display text-xl font-semibold text-[#141413]">
                      Console Service Clients
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAdminToken(null);
                      setAdminNotice('');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-[#D6D3C9] text-[#141413] rounded-lg hover:border-[#141413]"
                  >
                    <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Déconnexion</span>
                  </button>
                </div>

                {/* KPI Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-[#FAF9F6] border border-[#E4E1D8] rounded-lg">
                    <p className="text-xs text-[#52524E]">Commandes</p>
                    <p className="font-mono text-xl font-semibold tabular-nums text-[#141413] mt-0.5">
                      {orders.length}
                    </p>
                  </div>
                  <div className="p-3 bg-[#FAF9F6] border border-[#E4E1D8] rounded-lg">
                    <p className="text-xs text-[#52524E]">À confirmer</p>
                    <p className="font-mono text-xl font-semibold tabular-nums text-[#1E3A8A] mt-0.5">
                      {pendingOrdersCount}
                    </p>
                  </div>
                  <div className="p-3 bg-[#FAF9F6] border border-[#E4E1D8] rounded-lg">
                    <p className="text-xs text-[#52524E]">Tickets ouverts</p>
                    <p className="font-mono text-xl font-semibold tabular-nums text-[#141413] mt-0.5">
                      {openTicketsCount}
                    </p>
                  </div>
                  <div className="p-3 bg-[#FAF9F6] border border-[#E4E1D8] rounded-lg">
                    <p className="text-xs text-[#52524E]">Titres catalogue</p>
                    <p className="font-mono text-xl font-semibold tabular-nums text-[#141413] mt-0.5">
                      {books.length}
                    </p>
                  </div>
                </div>

                {adminNotice && (
                  <div className="px-3.5 py-2.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg text-xs text-[#166534] flex items-center justify-between gap-2">
                    <span>{adminNotice}</span>
                    <button
                      type="button"
                      onClick={() => setAdminNotice('')}
                      className="text-xs underline"
                    >
                      OK
                    </button>
                  </div>
                )}

                {/* Admin Tabs */}
                <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F2F0EB] rounded-lg">
                  {(
                    [
                      { id: 'commandes', label: 'Commandes', icon: Package },
                      { id: 'tickets', label: 'Demandes SAV', icon: MessageSquare },
                      { id: 'catalogue', label: 'Stocks & Livres', icon: Plus },
                      { id: 'promo', label: 'Bannière Promo', icon: Tag },
                    ] as const
                  ).map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                          active
                            ? 'bg-white text-[#141413] shadow-xs'
                            : 'text-[#52524E] hover:text-[#141413]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab 1: Orders */}
                {activeTab === 'commandes' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-[#52524E]">
                        Suivi des commandes en ligne et appels reçus au {orderPhone}.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowPhoneOrderForm((v) => !v)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#141413] text-white rounded-lg hover:bg-[#1E3A8A] whitespace-nowrap shrink-0"
                      >
                        <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{showPhoneOrderForm ? 'Fermer' : 'Saisir commande appel'}</span>
                      </button>
                    </div>

                    {showPhoneOrderForm && (
                      <form
                        onSubmit={handleCreatePhoneOrder}
                        className="p-4 bg-[#FAF9F6] border border-[#E4E1D8] rounded-lg space-y-3"
                      >
                        <p className="text-xs font-semibold text-[#141413]">
                          Nouvelle commande prise par téléphone ({orderPhone})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            required
                            value={poName}
                            onChange={(e) => setPoName(e.target.value)}
                            placeholder="Nom client *"
                            className="px-3 py-2 text-xs bg-white border border-[#D6D3C9] rounded-md"
                          />
                          <input
                            type="tel"
                            required
                            value={poPhone}
                            onChange={(e) => setPoPhone(e.target.value)}
                            placeholder="Téléphone client *"
                            className="px-3 py-2 text-xs font-mono bg-white border border-[#D6D3C9] rounded-md"
                          />
                          <input
                            type="text"
                            required
                            value={poAddress}
                            onChange={(e) => setPoAddress(e.target.value)}
                            placeholder="Adresse *"
                            className="px-3 py-2 text-xs bg-white border border-[#D6D3C9] rounded-md"
                          />
                          <input
                            type="text"
                            required
                            value={poCity}
                            onChange={(e) => setPoCity(e.target.value)}
                            placeholder="Ville *"
                            className="px-3 py-2 text-xs bg-white border border-[#D6D3C9] rounded-md"
                          />
                          <select
                            value={poBookId}
                            onChange={(e) => setPoBookId(e.target.value)}
                            className="px-3 py-2 text-xs bg-white border border-[#D6D3C9] rounded-md"
                          >
                            {books.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.title} ({b.price.toFixed(2)} € · stock {b.stock})
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={poQuantity}
                            onChange={(e) => setPoQuantity(Number(e.target.value) || 1)}
                            className="px-3 py-2 text-xs font-mono bg-white border border-[#D6D3C9] rounded-md"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2 text-xs font-medium bg-[#1E3A8A] text-white rounded-md hover:bg-[#172554]"
                        >
                          Enregistrer la commande téléphone
                        </button>
                      </form>
                    )}

                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="p-4 bg-[#FAF9F6] border border-[#E4E1D8] rounded-lg space-y-2.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="text-xs">
                              <span className="font-mono font-semibold text-[#141413]">
                                {order.id}
                              </span>
                              <span className="text-[#52524E]">
                                {' '}
                                · {order.customerName} ({order.phone}) · {order.channel}
                              </span>
                            </div>
                            <span className="font-mono text-sm font-semibold tabular-nums text-[#141413]">
                              {order.total.toFixed(2)} €
                            </span>
                          </div>

                          <p className="text-xs text-[#52524E]">
                            {order.items.map((i) => `${i.quantity}× ${i.title}`).join(' · ')}
                          </p>
                          <p className="text-xs text-[#52524E]">
                            Livraison : {order.address}, {order.postalCode} {order.city}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <select
                              aria-label={`Statut de la commande ${order.id}`}
                              value={order.status}
                              onChange={(e) =>
                                void handleUpdateOrder(
                                  order.id,
                                  e.target.value as OrderStatus,
                                  order.agentNote,
                                )
                              }
                              className="px-2.5 py-1.5 text-xs bg-white border border-[#D6D3C9] rounded-md text-[#141413]"
                            >
                              {ORDER_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                            {order.agentNote && (
                              <span className="text-xs text-[#52524E] italic">
                                Note : {order.agentNote}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 2: Tickets */}
                {activeTab === 'tickets' && (
                  <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="p-4 bg-[#FAF9F6] border border-[#E4E1D8] rounded-lg space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs">
                            <span className="font-mono font-semibold text-[#141413]">
                              {ticket.id}
                            </span>
                            <span className="text-[#52524E]">
                              {' '}
                              · {ticket.customerName} ({ticket.phone})
                              {ticket.orderRef ? ` · Réf ${ticket.orderRef}` : ''}
                            </span>
                          </p>
                          <select
                            aria-label={`Statut du ticket ${ticket.id}`}
                            value={ticket.status}
                            onChange={(e) =>
                              void handleUpdateTicket(
                                ticket.id,
                                e.target.value as TicketStatus,
                                ticket.replyNote,
                              )
                            }
                            className="px-2.5 py-1 text-xs bg-white border border-[#D6D3C9] rounded-md"
                          >
                            {TICKET_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                        <p className="text-sm font-medium text-[#141413]">{ticket.subject}</p>
                        <p className="text-xs text-[#52524E] leading-relaxed">{ticket.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 3: Catalog Management */}
                {activeTab === 'catalogue' && (
                  <div className="space-y-4">
                    <form
                      onSubmit={handleAddBook}
                      className="p-4 bg-[#FAF9F6] border border-[#E4E1D8] rounded-lg space-y-3"
                    >
                      <p className="text-xs font-semibold text-[#141413]">
                        Ajouter un livre (Neuf ou Usé / Occasion)
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="Titre du livre *"
                          className="px-3 py-2 text-xs bg-white border border-[#D6D3C9] rounded-md"
                        />
                        <input
                          type="text"
                          required
                          value={newAuthor}
                          onChange={(e) => setNewAuthor(e.target.value)}
                          placeholder="Auteur *"
                          className="px-3 py-2 text-xs bg-white border border-[#D6D3C9] rounded-md"
                        />
                        <select
                          value={newGenre}
                          onChange={(e) => setNewGenre(e.target.value as BookGenre)}
                          className="px-3 py-2 text-xs bg-white border border-[#D6D3C9] rounded-md"
                        >
                          {GENRES.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                        <select
                          value={newCondition}
                          onChange={(e) => {
                            const cond = e.target.value as BookCondition;
                            setNewCondition(cond);
                            setNewGrade(
                              cond === 'Neuf'
                                ? 'Neuf · Édition brochée'
                                : 'Occasion · Très bon état',
                            );
                          }}
                          className="px-3 py-2 text-xs bg-white border border-[#D6D3C9] rounded-md"
                        >
                          <option value="Usé">Usé / Occasion</option>
                          <option value="Neuf">Neuf</option>
                        </select>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          required
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          placeholder="Prix (€)"
                          className="px-3 py-2 text-xs font-mono bg-white border border-[#D6D3C9] rounded-md"
                        />
                        <input
                          type="number"
                          min="1"
                          required
                          value={newStock}
                          onChange={(e) => setNewStock(e.target.value)}
                          placeholder="Stock"
                          className="px-3 py-2 text-xs font-mono bg-white border border-[#D6D3C9] rounded-md"
                        />
                      </div>
                      <input
                        type="text"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Description / note sur l'état du livre..."
                        className="w-full px-3 py-2 text-xs bg-white border border-[#D6D3C9] rounded-md"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-medium bg-[#1E3A8A] text-white rounded-md hover:bg-[#172554]"
                      >
                        Ajouter au catalogue
                      </button>
                    </form>

                    <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                      {books.map((b) => (
                        <div
                          key={b.id}
                          className="px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E4E1D8] rounded-lg flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-[#141413] truncate">{b.title}</p>
                            <p className="text-[#52524E]">
                              {b.condition} · <span className="font-mono tabular-nums">{b.price.toFixed(2)} €</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => void handleAdjustStock(b, -1)}
                              className="px-2 py-1 border border-[#D6D3C9] bg-white rounded"
                              aria-label={`Diminuer le stock de ${b.title}`}
                            >
                              -
                            </button>
                            <span className="font-mono tabular-nums w-6 text-center">{b.stock}</span>
                            <button
                              type="button"
                              onClick={() => void handleAdjustStock(b, 1)}
                              className="px-2 py-1 border border-[#D6D3C9] bg-white rounded"
                              aria-label={`Augmenter le stock de ${b.title}`}
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteBook(b.id)}
                              aria-label={`Supprimer ${b.title}`}
                              className="p-1.5 text-[#78756E] hover:text-[#B91C1C]"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 4: Promotional Banner */}
                {activeTab === 'promo' && (
                  <form onSubmit={handleSavePromo} className="space-y-4 bg-[#FAF9F6] p-4 border border-[#E4E1D8] rounded-lg">
                    <label className="flex items-center gap-2.5 text-sm font-medium text-[#141413]">
                      <input
                        type="checkbox"
                        checked={promoEnabled}
                        onChange={(e) => setPromoEnabled(e.target.checked)}
                        className="w-4 h-4 accent-[#1E3A8A]"
                      />
                      <span>Afficher la bannière promotionnelle en haut de la boutique</span>
                    </label>

                    <div>
                      <label className="block text-xs font-medium text-[#52524E] mb-1">
                        Texte de la bannière
                      </label>
                      <input
                        type="text"
                        required
                        value={promoMessage}
                        onChange={(e) => setPromoMessage(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#D6D3C9] rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#52524E] mb-1">
                          Remise occasion (%)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={60}
                          value={promoPercent}
                          onChange={(e) => setPromoPercent(e.target.value)}
                          className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#D6D3C9] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#52524E] mb-1">
                          Seuil livres usés
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={promoMinUsed}
                          onChange={(e) => setPromoMinUsed(e.target.value)}
                          className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#D6D3C9] rounded-lg"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 text-xs font-medium bg-[#1E3A8A] text-white rounded-lg hover:bg-[#172554]"
                    >
                      Enregistrer la promotion
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

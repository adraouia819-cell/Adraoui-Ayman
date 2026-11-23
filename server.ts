import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import type {
  Book,
  BookCondition,
  BookConditionGrade,
  BookGenre,
  CustomerTicket,
  Order,
  OrderItem,
  OrderStatus,
  PromoBannerConfig,
  TicketStatus,
} from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const ORDER_PHONE = '0675215000';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const DATA_DIR = path.resolve(__dirname, '.data');
const STORE_PATH = path.resolve(DATA_DIR, 'store.json');

interface AdminAuthRecord {
  login: string;
  salt: string;
  hash: string;
}

interface StoreData {
  books: Book[];
  promo: PromoBannerConfig;
  orders: Order[];
  tickets: CustomerTicket[];
  adminAuth: AdminAuthRecord | null;
}

const DEFAULT_BOOKS: Book[] = [
  {
    id: 'bk-101',
    title: "L'Étranger — Édition de collection",
    author: 'Albert Camus',
    isbn: '978-2-07-036002-4',
    genre: 'Littérature',
    condition: 'Usé',
    conditionDetail: 'Occasion · Très bon état',
    price: 7.5,
    originalPrice: 14.0,
    stock: 4,
    pages: 186,
    year: 1998,
    publisher: 'Gallimard',
    description:
      'Exemplaire d’occasion soigneusement vérifié. Reliure intacte, pages légèrement patinées par le temps sans aucune annotation.',
    imageUrl: '/src/assets/images/book_vintage_literature_1795460407640.jpg',
  },
  {
    id: 'bk-102',
    title: 'Les Couleurs du Silence',
    author: 'Claire Delacroix',
    isbn: '978-2-253-18421-9',
    genre: 'Littérature',
    condition: 'Neuf',
    conditionDetail: 'Neuf · Édition originale',
    price: 21.0,
    stock: 9,
    pages: 312,
    year: 2026,
    publisher: 'Éditions du Rivage',
    description:
      'Roman contemporain relié toile bleu cobalt, papier ivoire 100g. Neuf sous blister éditeur, idéal pour offrir.',
    imageUrl: '/src/assets/images/book_new_hardcover_1795460409146.jpg',
  },
  {
    id: 'bk-103',
    title: 'Le Siècle des Lumières & la Raison',
    author: 'Marc-Antoine Lefèvre',
    isbn: '978-2-08-142095-3',
    genre: 'Essais & Histoire',
    condition: 'Neuf',
    conditionDetail: 'Neuf · Édition brochée',
    price: 24.5,
    stock: 6,
    pages: 428,
    year: 2025,
    publisher: 'Flammarion',
    description:
      'Essai historique complet avec cahier iconographique et index analytique. Édition neuve en grand format.',
    imageUrl: '/src/assets/images/book_history_essays_1795460408356.jpg',
  },
  {
    id: 'bk-104',
    title: 'Structure & Forme : Architecture Minimaliste',
    author: 'Hélène Vance & Studio Nord',
    isbn: '978-2-85025-912-0',
    genre: 'Art & Architecture',
    condition: 'Neuf',
    conditionDetail: 'Neuf · Édition originale',
    price: 38.0,
    stock: 5,
    pages: 256,
    year: 2025,
    publisher: 'Parenthèses',
    description:
      'Monographie grand format sur le béton architectural, la lumière naturelle et les proportions intemporelles.',
    imageUrl: '/src/assets/images/book_art_architecture_1795460408865.jpg',
  },
  {
    id: 'bk-105',
    title: '1984 — Tirage Vintage 1989',
    author: 'George Orwell',
    isbn: '978-2-07-036822-8',
    genre: 'Littérature',
    condition: 'Usé',
    conditionDetail: 'Occasion · Bon état',
    price: 6.0,
    originalPrice: 12.5,
    stock: 3,
    pages: 376,
    year: 1989,
    publisher: 'Folio Classique',
    description:
      'Édition ancienne recherchée. Couverture souple présentant une légère trace de lecture au dos, intérieur propre et complet.',
    imageUrl: '/src/assets/images/book_vintage_literature_1795460407640.jpg',
  },
  {
    id: 'bk-106',
    title: 'La Nuit des Quais',
    author: 'Sébastien Kerguelen',
    isbn: '978-2-7427-9831-1',
    genre: 'Polars & Suspense',
    condition: 'Usé',
    conditionDetail: 'Occasion · Comme neuf',
    price: 8.5,
    originalPrice: 19.9,
    stock: 5,
    pages: 344,
    year: 2023,
    publisher: 'Actes Sud',
    description:
      'Polar maritime haletant lu une seule fois. Tranche blanche impeccable, aucune pliure sur la couverture.',
    imageUrl: '/src/assets/images/book_new_hardcover_1795460409146.jpg',
  },
  {
    id: 'bk-107',
    title: 'Histoire de la Philosophie Moderne',
    author: 'Jean-Baptiste Moreau',
    isbn: '978-2-13-081442-5',
    genre: 'Essais & Histoire',
    condition: 'Usé',
    conditionDetail: 'Occasion · Très bon état',
    price: 11.0,
    originalPrice: 26.0,
    stock: 2,
    pages: 512,
    year: 2019,
    publisher: 'PUF',
    description:
      'Ouvrage de référence universitaire vérifié page par page. Couverture cartonnée solide, aucune surbrillance.',
    imageUrl: '/src/assets/images/book_history_essays_1795460408356.jpg',
  },
  {
    id: 'bk-108',
    title: 'L’Architecture du Bonheur',
    author: 'Alain de Botton',
    isbn: '978-2-253-12445-1',
    genre: 'Art & Architecture',
    condition: 'Usé',
    conditionDetail: 'Occasion · Bon état',
    price: 7.0,
    originalPrice: 15.5,
    stock: 4,
    pages: 288,
    year: 2016,
    publisher: 'Le Livre de Poche',
    description:
      'Réflexion passionnante sur la façon dont nos espaces façonnent notre esprit. Exemplaire d’occasion propre et vérifié.',
    imageUrl: '/src/assets/images/book_art_architecture_1795460408865.jpg',
  },
  {
    id: 'bk-109',
    title: 'Le Jardin des Étoiles',
    author: 'Nadia Benali',
    isbn: '978-2-211-31904-2',
    genre: 'Jeunesse',
    condition: 'Neuf',
    conditionDetail: 'Neuf · Édition originale',
    price: 15.5,
    stock: 11,
    pages: 144,
    year: 2026,
    publisher: 'L’École des Loisirs',
    description:
      'Album illustré grand format à partir de 8 ans, imprimé sur papier certifié FSC avec reliure cousue durable.',
    imageUrl: '/src/assets/images/book_new_hardcover_1795460409146.jpg',
  },
];

const DEFAULT_PROMO: PromoBannerConfig = {
  enabled: true,
  message:
    "Offre de bienvenue READY TO READ : -20% sur les livres d'occasion dès 3 titres · Commande directe au 0675215000",
  discountPercent: 20,
  minUsedBooks: 3,
  orderPhone: ORDER_PHONE,
};

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'RTR-1041',
    createdAt: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
    customerName: 'Salma El Mansouri',
    phone: '0661448820',
    address: '18 Avenue des Palmiers',
    city: 'Casablanca',
    postalCode: '20100',
    channel: 'Téléphone 0675215000',
    status: 'Confirmée par appel',
    items: [
      {
        bookId: 'bk-101',
        title: "L'Étranger — Édition de collection",
        condition: 'Usé',
        quantity: 1,
        unitPrice: 7.5,
      },
      {
        bookId: 'bk-105',
        title: '1984 — Tirage Vintage 1989',
        condition: 'Usé',
        quantity: 1,
        unitPrice: 6.0,
      },
      {
        bookId: 'bk-106',
        title: 'La Nuit des Quais',
        condition: 'Usé',
        quantity: 1,
        unitPrice: 8.5,
      },
    ],
    subtotal: 22.0,
    discountAmount: 4.4,
    shippingFee: 3.5,
    total: 21.1,
    notes: 'Livraison souhaitée après 17h.',
    agentNote: 'Appel confirmé le matin même, remise -20% occasion appliquée.',
  },
  {
    id: 'RTR-1042',
    createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    customerName: 'Karim Bennani',
    phone: '0678123490',
    address: '42 Rue Victor Hugo',
    city: 'Rabat',
    postalCode: '10000',
    channel: 'Boutique en ligne',
    status: 'En attente de confirmation',
    items: [
      {
        bookId: 'bk-104',
        title: 'Structure & Forme : Architecture Minimaliste',
        condition: 'Neuf',
        quantity: 1,
        unitPrice: 38.0,
      },
    ],
    subtotal: 38.0,
    discountAmount: 0,
    shippingFee: 0,
    total: 38.0,
    notes: 'Emballage cadeau si possible.',
  },
];

const DEFAULT_TICKETS: CustomerTicket[] = [
  {
    id: 'SAV-201',
    createdAt: new Date(Date.now() - 86400 * 1000).toISOString(),
    customerName: 'Leila Chraïbi',
    phone: '0655198201',
    email: 'leila.chraibi@example.com',
    orderRef: 'RTR-1041',
    subject: 'Recherche édition d’occasion épuisée',
    message:
      'Bonjour, auriez-vous une édition ancienne des Fleurs du Mal en bon état en stock cette semaine ?',
    status: 'En cours',
    replyNote: 'Vérification dans l’arrivage du mardi matin avant rappel.',
  },
  {
    id: 'SAV-202',
    createdAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    customerName: 'Youssef Amrani',
    phone: '0612904411',
    email: 'y.amrani@example.com',
    subject: 'Confirmation commande groupée',
    message:
      'Je souhaite commander 4 livres neufs pour un club de lecture. Pouvez-vous me rappeler ou confirmer le délai ?',
    status: 'Nouveau',
  },
];

function loadStore(): StoreData {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<StoreData>;
      return {
        books: Array.isArray(parsed.books) && parsed.books.length > 0 ? parsed.books : DEFAULT_BOOKS,
        promo: parsed.promo ? { ...DEFAULT_PROMO, ...parsed.promo, orderPhone: ORDER_PHONE } : DEFAULT_PROMO,
        orders: Array.isArray(parsed.orders) ? parsed.orders : DEFAULT_ORDERS,
        tickets: Array.isArray(parsed.tickets) ? parsed.tickets : DEFAULT_TICKETS,
        adminAuth: parsed.adminAuth ?? null,
      };
    }
  } catch {
    // Fallback to clean initial data if file cannot be parsed
  }
  return {
    books: structuredClone(DEFAULT_BOOKS),
    promo: structuredClone(DEFAULT_PROMO),
    orders: structuredClone(DEFAULT_ORDERS),
    tickets: structuredClone(DEFAULT_TICKETS),
    adminAuth: null,
  };
}

let store: StoreData = loadStore();

function persistStore(): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmpPath = `${STORE_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(store, null, 2), 'utf-8');
  fs.renameSync(tmpPath, STORE_PATH);
}

// Ensure initial data directory exists cleanly
persistStore();

function sha256Digest(value: string): Buffer {
  return crypto.createHash('sha256').update(value, 'utf8').digest();
}

function safeEqualStrings(a: string, b: string): boolean {
  return crypto.timingSafeEqual(sha256Digest(a), sha256Digest(b));
}

function getConfiguredEnvAdmin(): { login: string; code: string } | null {
  const code = (process.env.ADMIN_CONFIRMATION_CODE || '').trim();
  if (!code) return null;
  const login = (process.env.ADMIN_LOGIN || 'admin').trim() || 'admin';
  return { login, code };
}

function createSessionToken(adminLogin: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      sub: adminLogin,
      exp: Date.now() + 12 * 60 * 60 * 1000,
      nonce: crypto.randomBytes(8).toString('hex'),
    }),
    'utf8',
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string): { sub: string } | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  if (!payload || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  if (!safeEqualStrings(sig, expectedSig)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      sub?: string;
      exp?: number;
    };
    if (!parsed.sub || typeof parsed.exp !== 'number' || parsed.exp <= Date.now()) {
      return null;
    }
    return { sub: parsed.sub };
  } catch {
    return null;
  }
}

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function rateLimitAuth(req: Request, res: Response, next: NextFunction): void {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + 60_000 });
    next();
    return;
  }
  if (bucket.count >= 15) {
    res.status(429).json({ error: 'Trop de tentatives. Veuillez patienter une minute.' });
    return;
  }
  bucket.count += 1;
  next();
}

interface AuthenticatedRequest extends Request {
  adminUser?: string;
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentification requise pour le service clients.' });
    return;
  }
  const token = authHeader.slice('Bearer '.length).trim();
  const verified = verifySessionToken(token);
  if (!verified) {
    res.status(401).json({ error: 'Session expirée ou invalide. Veuillez vous reconnecter.' });
    return;
  }
  req.adminUser = verified.sub;
  next();
}

function cleanText(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

function calculateOrderTotals(
  items: { book: Book; quantity: number }[],
  promo: PromoBannerConfig,
): {
  orderItems: OrderItem[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
} {
  let subtotal = 0;
  let usedBookCount = 0;
  let usedBookSubtotal = 0;

  const orderItems: OrderItem[] = items.map(({ book, quantity }) => {
    const lineTotal = book.price * quantity;
    subtotal += lineTotal;
    if (book.condition === 'Usé') {
      usedBookCount += quantity;
      usedBookSubtotal += lineTotal;
    }
    return {
      bookId: book.id,
      title: book.title,
      condition: book.condition,
      quantity,
      unitPrice: book.price,
    };
  });

  const qualifiesForUsedPromo =
    promo.enabled && promo.discountPercent > 0 && usedBookCount >= promo.minUsedBooks;
  const discountAmount = qualifiesForUsedPromo
    ? Math.round(usedBookSubtotal * (promo.discountPercent / 100) * 100) / 100
    : 0;
  const discountedSubtotal = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);
  const shippingFee = discountedSubtotal >= 35 ? 0 : 3.5;
  const total = Math.round((discountedSubtotal + shippingFee) * 100) / 100;

  return {
    orderItems,
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount,
    shippingFee,
    total,
  };
}

const VALID_GENRES: BookGenre[] = [
  'Littérature',
  'Essais & Histoire',
  'Polars & Suspense',
  'Art & Architecture',
  'Jeunesse',
];
const VALID_CONDITIONS: BookCondition[] = ['Neuf', 'Usé'];
const VALID_GRADES: BookConditionGrade[] = [
  'Neuf · Édition originale',
  'Neuf · Édition brochée',
  'Occasion · Comme neuf',
  'Occasion · Très bon état',
  'Occasion · Bon état',
];
const VALID_ORDER_STATUSES: OrderStatus[] = [
  'En attente de confirmation',
  'Confirmée par appel',
  'En préparation',
  'Expédiée',
  'Livrée',
  'Annulée',
];
const VALID_TICKET_STATUSES: TicketStatus[] = ['Nouveau', 'En cours', 'Résolu'];

const ALLOWED_IMAGE_MAP: Record<BookGenre, string> = {
  Littérature: '/src/assets/images/book_vintage_literature_1795460407640.jpg',
  'Essais & Histoire': '/src/assets/images/book_history_essays_1795460408356.jpg',
  'Polars & Suspense': '/src/assets/images/book_new_hardcover_1795460409146.jpg',
  'Art & Architecture': '/src/assets/images/book_art_architecture_1795460408865.jpg',
  Jeunesse: '/src/assets/images/book_new_hardcover_1795460409146.jpg',
};

async function startServer(): Promise<void> {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '256kb' }));

  // Public Storefront Read API
  app.get('/api/store', (_req, res) => {
    res.json({
      books: store.books,
      promo: store.promo,
      orderPhone: ORDER_PHONE,
    });
  });

  // Public Checkout Order Creation
  app.post('/api/orders', (req, res) => {
    const body = req.body as Record<string, unknown>;
    const customerName = cleanText(body.customerName, 120);
    const phone = cleanText(body.phone, 30);
    const address = cleanText(body.address, 220);
    const city = cleanText(body.city, 80);
    const postalCode = cleanText(body.postalCode, 20);
    const notes = cleanText(body.notes, 300);
    const rawItems = Array.isArray(body.items) ? body.items : [];

    if (!customerName || !phone || !address || !city || !postalCode) {
      res.status(400).json({ error: 'Veuillez renseigner tous les champs de livraison obligatoires.' });
      return;
    }
    if (rawItems.length === 0 || rawItems.length > 30) {
      res.status(400).json({ error: 'Votre panier est vide ou contient trop de références.' });
      return;
    }

    const resolvedItems: { book: Book; quantity: number }[] = [];
    for (const entry of rawItems) {
      if (!entry || typeof entry !== 'object') {
        res.status(400).json({ error: 'Article invalide dans la commande.' });
        return;
      }
      const itemObj = entry as Record<string, unknown>;
      const bookId = cleanText(itemObj.bookId, 40);
      const qty = typeof itemObj.quantity === 'number' ? Math.floor(itemObj.quantity) : 0;
      if (!bookId || qty < 1 || qty > 20) {
        res.status(400).json({ error: 'Quantité invalide pour un livre.' });
        return;
      }
      const book = store.books.find((b) => b.id === bookId);
      if (!book) {
        res.status(404).json({ error: 'Un ouvrage sélectionné est introuvable.' });
        return;
      }
      if (book.stock < qty) {
        res.status(409).json({ error: `Stock insuffisant pour "${book.title}".` });
        return;
      }
      resolvedItems.push({ book, quantity: qty });
    }

    for (const { book, quantity } of resolvedItems) {
      book.stock -= quantity;
    }

    const totals = calculateOrderTotals(resolvedItems, store.promo);
    const orderNum = 1043 + store.orders.length;
    const newOrder: Order = {
      id: `RTR-${orderNum}`,
      createdAt: new Date().toISOString(),
      customerName,
      phone,
      address,
      city,
      postalCode,
      channel: 'Boutique en ligne',
      status: 'En attente de confirmation',
      items: totals.orderItems,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      shippingFee: totals.shippingFee,
      total: totals.total,
      notes: notes || undefined,
    };

    store.orders.unshift(newOrder);
    persistStore();
    res.status(201).json({ order: newOrder, books: store.books });
  });

  // Public Customer Service Inquiry Creation
  app.post('/api/tickets', (req, res) => {
    const body = req.body as Record<string, unknown>;
    const customerName = cleanText(body.customerName, 120);
    const phone = cleanText(body.phone, 30);
    const email = cleanText(body.email, 120);
    const orderRef = cleanText(body.orderRef, 40);
    const subject = cleanText(body.subject, 140);
    const message = cleanText(body.message, 1000);

    if (!customerName || !phone || !subject || !message) {
      res.status(400).json({ error: 'Nom, téléphone, objet et message sont obligatoires.' });
      return;
    }

    const ticketNum = 203 + store.tickets.length;
    const newTicket: CustomerTicket = {
      id: `SAV-${ticketNum}`,
      createdAt: new Date().toISOString(),
      customerName,
      phone,
      email: email || 'non-renseigne@client.local',
      orderRef: orderRef || undefined,
      subject,
      message,
      status: 'Nouveau',
    };

    store.tickets.unshift(newTicket);
    persistStore();
    res.status(201).json({ ticket: newTicket });
  });

  // Admin Auth Status
  app.get('/api/admin/status', (_req, res) => {
    const envAdmin = getConfiguredEnvAdmin();
    const needsSetup = !envAdmin && !store.adminAuth;
    res.json({
      needsSetup,
      defaultLogin: envAdmin?.login || store.adminAuth?.login || process.env.ADMIN_LOGIN || 'admin',
    });
  });

  // One-Time First-Run Admin Claim (when env passcode is not set)
  app.post('/api/admin/setup', rateLimitAuth, (req, res) => {
    if (getConfiguredEnvAdmin() || store.adminAuth) {
      res.status(409).json({ error: "L'accès administrateur est déjà configuré." });
      return;
    }
    const body = req.body as Record<string, unknown>;
    const login = cleanText(body.login, 64) || 'admin';
    const confirmationCode = cleanText(body.confirmationCode, 64);

    if (login.length < 2 || confirmationCode.length < 4) {
      res.status(400).json({
        error: 'Le login (min. 2 caractères) et le code de confirmation (min. 4 caractères) sont requis.',
      });
      return;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(confirmationCode, salt, 64).toString('hex');
    store.adminAuth = { login, salt, hash };
    persistStore();

    const token = createSessionToken(login);
    res.status(201).json({ token, adminLogin: login });
  });

  // Admin Login
  app.post('/api/admin/login', rateLimitAuth, (req, res) => {
    const body = req.body as Record<string, unknown>;
    const login = cleanText(body.login, 64);
    const confirmationCode = cleanText(body.confirmationCode, 64);

    if (!login || !confirmationCode) {
      res.status(400).json({ error: 'Identifiant et code de confirmation requis.' });
      return;
    }

    const envAdmin = getConfiguredEnvAdmin();
    if (envAdmin) {
      const loginMatches = safeEqualStrings(login, envAdmin.login);
      const codeMatches = safeEqualStrings(confirmationCode, envAdmin.code);
      if (!loginMatches || !codeMatches) {
        res.status(401).json({ error: 'Identifiant ou code de confirmation incorrect.' });
        return;
      }
      const token = createSessionToken(envAdmin.login);
      res.json({ token, adminLogin: envAdmin.login });
      return;
    }

    if (!store.adminAuth) {
      res.status(409).json({ error: 'Configuration initiale requise avant connexion.' });
      return;
    }

    const loginMatches = safeEqualStrings(login, store.adminAuth.login);
    const derived = crypto.scryptSync(confirmationCode, store.adminAuth.salt, 64);
    const storedHash = Buffer.from(store.adminAuth.hash, 'hex');
    const codeMatches = derived.length === storedHash.length && crypto.timingSafeEqual(derived, storedHash);

    if (!loginMatches || !codeMatches) {
      res.status(401).json({ error: 'Identifiant ou code de confirmation incorrect.' });
      return;
    }

    const token = createSessionToken(store.adminAuth.login);
    res.json({ token, adminLogin: store.adminAuth.login });
  });

  // Protected Admin Dashboard
  app.get('/api/admin/dashboard', requireAdmin, (_req, res) => {
    res.json({
      orders: store.orders,
      tickets: store.tickets,
      books: store.books,
      promo: store.promo,
    });
  });

  // Protected: Update Order Status & Agent Note
  app.patch('/api/admin/orders/:id', requireAdmin, (req, res) => {
    const orderId = cleanText(req.params.id, 40);
    const order = store.orders.find((o) => o.id === orderId);
    if (!order) {
      res.status(404).json({ error: 'Commande introuvable.' });
      return;
    }
    const body = req.body as Record<string, unknown>;
    if (body.status !== undefined) {
      const nextStatus = cleanText(body.status, 50) as OrderStatus;
      if (!VALID_ORDER_STATUSES.includes(nextStatus)) {
        res.status(400).json({ error: 'Statut de commande invalide.' });
        return;
      }
      order.status = nextStatus;
    }
    if (body.agentNote !== undefined) {
      order.agentNote = cleanText(body.agentNote, 300) || undefined;
    }
    persistStore();
    res.json({ order });
  });

  // Protected: Log Direct Phone Order (0675215000)
  app.post('/api/admin/orders/phone', requireAdmin, (req, res) => {
    const body = req.body as Record<string, unknown>;
    const customerName = cleanText(body.customerName, 120);
    const phone = cleanText(body.phone, 30);
    const address = cleanText(body.address, 220);
    const city = cleanText(body.city, 80);
    const postalCode = cleanText(body.postalCode, 20);
    const bookId = cleanText(body.bookId, 40);
    const quantity = typeof body.quantity === 'number' ? Math.floor(body.quantity) : 1;
    const agentNote = cleanText(body.agentNote, 300);

    if (!customerName || !phone || !address || !city || !bookId || quantity < 1 || quantity > 20) {
      res.status(400).json({ error: 'Informations client et ouvrage requises.' });
      return;
    }

    const book = store.books.find((b) => b.id === bookId);
    if (!book) {
      res.status(404).json({ error: 'Ouvrage introuvable.' });
      return;
    }
    if (book.stock < quantity) {
      res.status(409).json({ error: `Stock insuffisant pour "${book.title}".` });
      return;
    }

    book.stock -= quantity;
    const totals = calculateOrderTotals([{ book, quantity }], store.promo);
    const orderNum = 1043 + store.orders.length;
    const newOrder: Order = {
      id: `RTR-${orderNum}`,
      createdAt: new Date().toISOString(),
      customerName,
      phone,
      address,
      city,
      postalCode: postalCode || '00000',
      channel: 'Téléphone 0675215000',
      status: 'Confirmée par appel',
      items: totals.orderItems,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      shippingFee: totals.shippingFee,
      total: totals.total,
      agentNote: agentNote || 'Enregistrée par le service client via 0675215000.',
    };

    store.orders.unshift(newOrder);
    persistStore();
    res.status(201).json({ order: newOrder, books: store.books });
  });

  // Protected: Update Customer Service Ticket
  app.patch('/api/admin/tickets/:id', requireAdmin, (req, res) => {
    const ticketId = cleanText(req.params.id, 40);
    const ticket = store.tickets.find((t) => t.id === ticketId);
    if (!ticket) {
      res.status(404).json({ error: 'Ticket introuvable.' });
      return;
    }
    const body = req.body as Record<string, unknown>;
    if (body.status !== undefined) {
      const nextStatus = cleanText(body.status, 30) as TicketStatus;
      if (!VALID_TICKET_STATUSES.includes(nextStatus)) {
        res.status(400).json({ error: 'Statut de ticket invalide.' });
        return;
      }
      ticket.status = nextStatus;
    }
    if (body.replyNote !== undefined) {
      ticket.replyNote = cleanText(body.replyNote, 400) || undefined;
    }
    persistStore();
    res.json({ ticket });
  });

  // Protected: Add Book to Catalog
  app.post('/api/admin/books', requireAdmin, (req, res) => {
    const body = req.body as Record<string, unknown>;
    const title = cleanText(body.title, 160);
    const author = cleanText(body.author, 120);
    const isbn = cleanText(body.isbn, 32) || `978-2-${Math.floor(100000 + Math.random() * 899999)}-0`;
    const genre = cleanText(body.genre, 50) as BookGenre;
    const condition = cleanText(body.condition, 20) as BookCondition;
    const conditionDetail = cleanText(body.conditionDetail, 60) as BookConditionGrade;
    const price = typeof body.price === 'number' ? Math.round(body.price * 100) / 100 : 0;
    const originalPrice =
      typeof body.originalPrice === 'number' && body.originalPrice > price
        ? Math.round(body.originalPrice * 100) / 100
        : undefined;
    const stock = typeof body.stock === 'number' ? Math.max(0, Math.floor(body.stock)) : 1;
    const pages = typeof body.pages === 'number' ? Math.max(20, Math.floor(body.pages)) : 220;
    const year = typeof body.year === 'number' ? Math.floor(body.year) : 2025;
    const publisher = cleanText(body.publisher, 80) || 'Éditions READY TO READ';
    const description =
      cleanText(body.description, 400) ||
      'Ouvrage contrôlé par notre équipe READY TO READ avant mise en rayon.';

    if (!title || !author || !VALID_GENRES.includes(genre) || !VALID_CONDITIONS.includes(condition) || price <= 0) {
      res.status(400).json({ error: 'Titre, auteur, genre, état et prix positif requis.' });
      return;
    }

    const safeGrade = VALID_GRADES.includes(conditionDetail)
      ? conditionDetail
      : condition === 'Neuf'
        ? 'Neuf · Édition brochée'
        : 'Occasion · Très bon état';

    const newBook: Book = {
      id: `bk-${Date.now().toString(36)}`,
      title,
      author,
      isbn,
      genre,
      condition,
      conditionDetail: safeGrade,
      price,
      originalPrice,
      stock,
      pages,
      year,
      publisher,
      description,
      imageUrl: ALLOWED_IMAGE_MAP[genre],
    };

    store.books.unshift(newBook);
    persistStore();
    res.status(201).json({ book: newBook });
  });

  // Protected: Update Book Stock / Price
  app.patch('/api/admin/books/:id', requireAdmin, (req, res) => {
    const bookId = cleanText(req.params.id, 40);
    const book = store.books.find((b) => b.id === bookId);
    if (!book) {
      res.status(404).json({ error: 'Ouvrage introuvable.' });
      return;
    }
    const body = req.body as Record<string, unknown>;
    if (typeof body.stock === 'number' && body.stock >= 0) {
      book.stock = Math.floor(body.stock);
    }
    if (typeof body.price === 'number' && body.price > 0) {
      book.price = Math.round(body.price * 100) / 100;
    }
    persistStore();
    res.json({ book });
  });

  // Protected: Delete Book
  app.delete('/api/admin/books/:id', requireAdmin, (req, res) => {
    const bookId = cleanText(req.params.id, 40);
    const idx = store.books.findIndex((b) => b.id === bookId);
    if (idx === -1) {
      res.status(404).json({ error: 'Ouvrage introuvable.' });
      return;
    }
    store.books.splice(idx, 1);
    persistStore();
    res.json({ deletedId: bookId });
  });

  // Protected: Update Promotional Banner
  app.patch('/api/admin/promo', requireAdmin, (req, res) => {
    const body = req.body as Record<string, unknown>;
    if (typeof body.enabled === 'boolean') {
      store.promo.enabled = body.enabled;
    }
    if (typeof body.message === 'string') {
      const msg = cleanText(body.message, 180);
      if (msg) store.promo.message = msg;
    }
    if (typeof body.discountPercent === 'number') {
      store.promo.discountPercent = Math.min(60, Math.max(0, Math.floor(body.discountPercent)));
    }
    if (typeof body.minUsedBooks === 'number') {
      store.promo.minUsedBooks = Math.min(10, Math.max(1, Math.floor(body.minUsedBooks)));
    }
    persistStore();
    res.json({ promo: store.promo });
  });

  // Vite Dev Middleware or Static Production Build
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`READY TO READ server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

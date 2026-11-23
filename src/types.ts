export type BookCondition = 'Neuf' | 'Usé';

export type BookConditionGrade =
  | 'Neuf · Édition originale'
  | 'Neuf · Édition brochée'
  | 'Occasion · Comme neuf'
  | 'Occasion · Très bon état'
  | 'Occasion · Bon état';

export type BookGenre =
  | 'Littérature'
  | 'Essais & Histoire'
  | 'Polars & Suspense'
  | 'Art & Architecture'
  | 'Jeunesse';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  genre: BookGenre;
  condition: BookCondition;
  conditionDetail: BookConditionGrade;
  price: number;
  originalPrice?: number;
  stock: number;
  pages: number;
  year: number;
  publisher: string;
  description: string;
  imageUrl: string;
}

export interface PromoBannerConfig {
  enabled: boolean;
  message: string;
  discountPercent: number;
  minUsedBooks: number;
  orderPhone: string;
}

export type OrderStatus =
  | 'En attente de confirmation'
  | 'Confirmée par appel'
  | 'En préparation'
  | 'Expédiée'
  | 'Livrée'
  | 'Annulée';

export type OrderChannel = 'Boutique en ligne' | 'Téléphone 0675215000';

export interface OrderItem {
  bookId: string;
  title: string;
  condition: BookCondition;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  channel: OrderChannel;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  notes?: string;
  agentNote?: string;
}

export type TicketStatus = 'Nouveau' | 'En cours' | 'Résolu';

export interface CustomerTicket {
  id: string;
  createdAt: string;
  customerName: string;
  phone: string;
  email: string;
  orderRef?: string;
  subject: string;
  message: string;
  status: TicketStatus;
  replyNote?: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface AdminStatusResponse {
  needsSetup: boolean;
  defaultLogin: string;
}

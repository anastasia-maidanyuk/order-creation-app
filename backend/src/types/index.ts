export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  items: OrderItemInput[];
}

export interface OrderLine {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderResult {
  orderId: string;
  lines: OrderLine[];
  subtotal: number;
  discountApplied: boolean;
  discountRate: number;
  total: number;
  createdAt: string;
}

export class OrderValidationError extends Error {
  constructor(message: string, public productId?: string) {
    super(message);
    this.name = 'OrderValidationError';
  }
}

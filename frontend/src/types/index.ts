export interface Product {
  images: string[];
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
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

export interface ApiError {
  message: string;
  productId?: string;
}

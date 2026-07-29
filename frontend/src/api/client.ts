import { Product, CartItem, OrderResult, ApiError } from '../types';

export class ApiRequestError extends Error {
  constructor(message: string, public productId?: string) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch('/api/products');
  if (!res.ok) {
    throw new Error('Could not load products.');
  }
  return res.json();
}

export async function fetchOrders(): Promise<OrderResult[]> {
  const res = await fetch('/api/orders');
  if (!res.ok) {
    throw new Error('Could not load order history.');
  }
  return res.json();
}

export async function submitOrder(items: CartItem[]): Promise<OrderResult> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });

  if (!res.ok) {
    const body: ApiError = await res.json().catch(() => ({ message: 'Order creation failed.' }));
    throw new ApiRequestError(body.message, body.productId);
  }

  return res.json();
}
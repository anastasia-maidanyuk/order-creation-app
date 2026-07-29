import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import {
  Product,
  CreateOrderRequest,
  OrderResult,
  OrderLine,
  OrderValidationError,
} from '../types';

const DATA_PATH = path.join(__dirname, '..', 'data', 'products.json');
const ORDERS_PATH = path.join(__dirname, '..', 'data', 'orders.json');
const DISCOUNT_THRESHOLD = 100;
const DISCOUNT_RATE = 0.1;

let products: Product[] = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

let orders: OrderResult[] = fs.existsSync(ORDERS_PATH)
  ? JSON.parse(fs.readFileSync(ORDERS_PATH, 'utf-8'))
  : [];

function persistProducts(): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(products, null, 2));
}

function persistOrders(): void {
  fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2));
}

export function getProducts(): Product[] {
  return products;
}

export function getOrders(): OrderResult[] {
  return orders;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function validateAndBuildLines(request: CreateOrderRequest): OrderLine[] {
  if (!Array.isArray(request.items) || request.items.length === 0) {
    throw new OrderValidationError('An order must contain at least one item.');
  }

  const lines: OrderLine[] = [];
  const seenProductIds = new Set<string>();

  for (const item of request.items) {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof item.productId !== 'string' ||
      item.productId.trim() === ''
    ) {
      throw new OrderValidationError('Each order item must include a valid productId.');
    }

    if (seenProductIds.has(item.productId)) {
      throw new OrderValidationError(
        `Product "${item.productId}" was added more than once. Combine duplicate items into a single quantity.`,
        item.productId,
      );
    }
    seenProductIds.add(item.productId);

    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      throw new OrderValidationError(
        `Product "${item.productId}" does not exist.`,
        item.productId,
      );
    }

    if (!isPositiveInteger(item.quantity)) {
      throw new OrderValidationError(
        `Quantity for "${product.name}" must be a positive integer.`,
        item.productId,
      );
    }

    if (product.stock === 0) {
      throw new OrderValidationError(
        `"${product.name}" is out of stock.`,
        item.productId,
      );
    }

    if (item.quantity > product.stock) {
      throw new OrderValidationError(
        `Only ${product.stock} unit(s) of "${product.name}" are available.`,
        item.productId,
      );
    }

    lines.push({
      productId: product.id,
      name: product.name,
      unitPrice: product.price,
      quantity: item.quantity,
      lineTotal: Math.round(product.price * item.quantity * 100) / 100,
    });
  }

  return lines;
}

export function createOrder(request: CreateOrderRequest): OrderResult {
  const lines = validateAndBuildLines(request);

  const subtotal = Math.round(
    lines.reduce((sum, line) => sum + line.lineTotal, 0) * 100,
  ) / 100;

  const discountApplied = subtotal > DISCOUNT_THRESHOLD;
  const total = discountApplied
    ? Math.round(subtotal * (1 - DISCOUNT_RATE) * 100) / 100
    : subtotal;

  for (const line of lines) {
    const product = products.find((p) => p.id === line.productId)!;
    product.stock -= line.quantity;
  }
  persistProducts();

  const result: OrderResult = {
    orderId: randomUUID(),
    lines,
    subtotal,
    discountApplied,
    discountRate: discountApplied ? DISCOUNT_RATE : 0,
    total,
    createdAt: new Date().toISOString(),
  };

  orders.push(result);
  persistOrders();

  return result;
}

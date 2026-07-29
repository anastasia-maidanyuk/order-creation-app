import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(__dirname, '..', 'data', 'products.json');
const original = fs.readFileSync(DATA_PATH, 'utf-8');

beforeEach(() => {
  fs.writeFileSync(DATA_PATH, original);
  vi.resetModules();
});

afterAll(() => {
  fs.writeFileSync(DATA_PATH, original);
});

describe('createOrder', () => {
  it('creates an order and reduces stock', async () => {
    const { createOrder, getProducts } = await import('./orderService');
    const before = getProducts().find((p) => p.id === 'p1')!.stock;

    const order = createOrder({ items: [{ productId: 'p1', quantity: 2 }] });

    expect(order.lines).toHaveLength(1);
    expect(order.subtotal).toBeCloseTo(order.lines[0].lineTotal);
    const after = getProducts().find((p) => p.id === 'p1')!.stock;
    expect(after).toBe(before - 2);
  });

  it('applies a 10% discount when total exceeds £100', async () => {
    const { createOrder } = await import('./orderService');
    const order = createOrder({ items: [{ productId: 'p3', quantity: 1 }] });

    expect(order.discountApplied).toBe(true);
    expect(order.total).toBeCloseTo(189 * 0.9);
  });

  it('rejects an order for a product that does not exist', async () => {
    const { createOrder } = await import('./orderService');
    expect(() => createOrder({ items: [{ productId: 'does-not-exist', quantity: 1 }] })).toThrow(
      /does not exist/,
    );
  });

  it('rejects a non-positive or non-integer quantity', async () => {
    const { createOrder } = await import('./orderService');
    expect(() => createOrder({ items: [{ productId: 'p1', quantity: 0 }] })).toThrow();
    expect(() => createOrder({ items: [{ productId: 'p1', quantity: -1 }] })).toThrow();
    expect(() => createOrder({ items: [{ productId: 'p1', quantity: 1.5 }] })).toThrow();
  });

  it('rejects an order exceeding available stock', async () => {
    const { createOrder } = await import('./orderService');
    expect(() => createOrder({ items: [{ productId: 'p3', quantity: 999 }] })).toThrow(
      /available/,
    );
  });

  it('rejects a product with zero stock', async () => {
    const { createOrder } = await import('./orderService');
    expect(() => createOrder({ items: [{ productId: 'p5', quantity: 1 }] })).toThrow(
      /out of stock/,
    );
  });
});

import { ShoppingBag, X } from 'lucide-react';
import { CartItem, Product } from '../types';

interface Props {
  items: CartItem[];
  products: Product[];
  onRemove: (productId: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}

export function Cart({ items, products, onRemove, onSubmit, submitting }: Props) {
  const lines = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      ...item,
      name: product?.name ?? item.productId,
      price: product?.price ?? 0,
    };
  });

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const willDiscount = subtotal > 100;
  const estimatedTotal = willDiscount ? subtotal * 0.9 : subtotal;

  if (items.length === 0) {
    return (
      <div className="cart cart-empty">
        <div className="cart-empty-icon">
          <ShoppingBag size={22} />
        </div>
        <h2>Your order</h2>
        <p>No items added yet. Pick a quantity and press "Add" on a product.</p>
      </div>
    );
  }

  return (
    <div className="cart">
      <h2>Your order</h2>
      <ul className="cart-lines">
        {lines.map((line) => (
          <li key={line.productId}>
            <div className="cart-line-info">
              <span className="cart-line-name">{line.name}</span>
              <span className="cart-line-qty">Qty {line.quantity}</span>
            </div>
            <span className="cart-line-price">£{(line.price * line.quantity).toFixed(2)}</span>
            <button
              type="button"
              className="remove-button"
              aria-label={`Remove ${line.name}`}
              onClick={() => onRemove(line.productId)}
            >
              <X size={15} />
            </button>
          </li>
        ))}
      </ul>
      <div className="cart-summary">
        <div>
          <span>Subtotal</span>
          <span>£{subtotal.toFixed(2)}</span>
        </div>
        {willDiscount && (
          <div className="discount-line">
            <span>10% discount (over £100)</span>
            <span>-£{(subtotal - estimatedTotal).toFixed(2)}</span>
          </div>
        )}
        <div className="cart-total">
          <span>Total</span>
          <span>£{estimatedTotal.toFixed(2)}</span>
        </div>
      </div>
      <button type="button" className="submit-button" onClick={onSubmit} disabled={submitting}>
        {submitting ? 'Placing order…' : 'Place order'}
      </button>
    </div>
  );
}

import { CheckCircle2, XCircle } from 'lucide-react';
import { OrderResult } from '../types';

interface Props {
  order: OrderResult | null;
  error: string | null;
  onDismiss: () => void;
}

export function OrderOutcome({ order, error, onDismiss }: Props) {
  if (!order && !error) return null;

  if (error) {
    return (
      <div className="outcome outcome-error" role="alert">
        <div className="outcome-icon outcome-icon-error">
          <XCircle size={28} />
        </div>
        <h2>Order could not be created</h2>
        <p>{error}</p>
        <button type="button" onClick={onDismiss}>Try again</button>
      </div>
    );
  }

  return (
    <div className="outcome outcome-success" role="status">
      <div className="outcome-icon outcome-icon-success">
        <CheckCircle2 size={28} />
      </div>
      <h2>Order created</h2>
      <p className="order-id">Order ID: {order!.orderId}</p>
      <ul>
        {order!.lines.map((line) => (
          <li key={line.productId}>
            <span>{line.name} × {line.quantity}</span>
            <span>£{line.lineTotal.toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className="outcome-summary">
        <div>
          <span>Subtotal</span>
          <span>£{order!.subtotal.toFixed(2)}</span>
        </div>
        {order!.discountApplied && (
          <div className="discount-line">
            <span>Discount ({order!.discountRate * 100}%)</span>
            <span>-£{(order!.subtotal - order!.total).toFixed(2)}</span>
          </div>
        )}
        <div className="cart-total">
          <span>Total charged</span>
          <span>£{order!.total.toFixed(2)}</span>
        </div>
      </div>
      <button type="button" onClick={onDismiss}>Place another order</button>
    </div>
  );
}
  
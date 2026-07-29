import { useEffect, useState } from 'react';
import { History, RefreshCw } from 'lucide-react';
import { OrderResult } from '../types';
import { fetchOrders } from '../api/client';

export function OrderHistory() {
  const [orders, setOrders] = useState<OrderResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load(isManualRefresh = false) {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    fetchOrders()
      .then((data) => {
        // Most recent first.
        setOrders([...data].reverse());
        setError(null);
      })
      .catch(() => setError('Could not load order history.'))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p>Loading order history…</p>;
  if (error) return <p className="load-error">{error}</p>;

  return (
    <div className="order-history">
      <div className="order-history-header">
        <h2>
          <History size={18} /> Order History
        </h2>
        <button
          type="button"
          className="refresh-button"
          onClick={() => load(true)}
          disabled={refreshing}
          aria-label="Refresh order history"
        >
          <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
        </button>
      </div>

      {orders.length === 0 && <p className="no-results">No orders placed yet.</p>}

      <ul className="order-history-list">
        {orders.map((order) => (
          <li key={order.orderId} className="order-history-item">
            <div className="order-history-item-top">
              <span className="order-history-id">#{order.orderId.slice(0, 8)}</span>
              <span className="order-history-date">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>
            <ul className="order-history-lines">
              {order.lines.map((line) => (
                <li key={line.productId}>
                  {line.name} × {line.quantity}
                </li>
              ))}
            </ul>
            <div className="order-history-total">
              {order.discountApplied && (
                <span className="discount-tag">10% discount applied</span>
              )}
              <span className="order-history-total-amount">£{order.total.toFixed(2)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
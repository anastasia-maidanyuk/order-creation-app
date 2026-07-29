import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Product, CartItem, OrderResult } from './types';
import { fetchProducts, submitOrder, ApiRequestError } from './api/client';
import { ProductList } from './components/ProductList';
import { Cart } from './components/Cart';
import { OrderOutcome } from './components/OrderOutcome';
import { useDebounce } from './hooks/useDebounce';
import { OrderHistory } from './components/OrderHistory';
import './styles.css';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [fieldErrorProductId, setFieldErrorProductId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'order' | 'history'>('order');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'stock-desc'>('default');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  function loadProducts() {
    setLoadingProducts(true);
    fetchProducts()
      .then((data) => {
        setProducts(data);
        setLoadError(null);
      })
      .catch(() => setLoadError('Could not load products. Is the backend running?'))
      .finally(() => setLoadingProducts(false));
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, sortBy]);

 function handleQuantityChange(productId: string, value: string) {
  setQuantities((prev) => ({ ...prev, [productId]: value }));
 
  if (fieldErrorProductId === productId) {
    setFieldError(null);
    setFieldErrorProductId(null);
  }
}

  function handleAdd(productId: string) {
    setFieldError(null);
    setFieldErrorProductId(null);

    const product = products.find((p) => p.id === productId);
    const raw = quantities[productId];
    const parsed = Number(raw);
    const alreadyInCart = cart.find((i) => i.productId === productId)?.quantity ?? 0;
    const remaining = product ? product.stock - alreadyInCart : 0;

    if (!raw || !Number.isInteger(parsed) || parsed <= 0) {
      setFieldError('Enter a positive whole number for the quantity.');
      setFieldErrorProductId(productId);
      return;
    }
    if (product && parsed > remaining) {
      setFieldError(
        `Only ${remaining} unit(s) of "${product.name}" are available (you already have ${alreadyInCart} in your order).`,
      );
      setFieldErrorProductId(productId);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + parsed } : item,
        );
      }
      return [...prev, { productId, quantity: parsed }];
    });
    setQuantities((prev) => ({ ...prev, [productId]: '' }));
  }

  function handleRemove(productId: string) {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitOrder(cart);
      setOrder(result);
      setCart([]);
      loadProducts(); 
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setSubmitError(err.message);
      } else {
        setSubmitError('Something went wrong while creating the order. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleDismissOutcome() {
    setOrder(null);
    setSubmitError(null);
  }

  const filteredProducts = useMemo(() => {
    const term = debouncedSearchTerm.trim().toLowerCase();
    const result = term ? products.filter((p) => p.name.toLowerCase().includes(term)) : [...products];

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'stock-desc':
        result.sort((a, b) => b.stock - a.stock);
        break;
      default:
        break;
    }

    return result;
  }, [products, debouncedSearchTerm, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const cartQuantities = Object.fromEntries(
    cart.map((item) => [item.productId, item.quantity]),
  );

  return (
    <div className="app">
      <header>
        <h1>Order Creation</h1>
        <p className="subtitle">Pick products and quantities, then place your order.</p>
        <div className="tabs">
          <button
            type="button"
            className={activeTab === 'order' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('order')}
          >
            New Order
          </button>
          <button
            type="button"
            className={activeTab === 'history' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('history')}
          >
            Order History
          </button>
        </div>
      </header>

      {activeTab === 'history' && <OrderHistory />}

      {activeTab === 'order' && (
        <>
          {loadingProducts && <p>Loading products…</p>}
          {loadError && <p className="load-error">{loadError}</p>}

          {!loadingProducts && !loadError && (order || submitError) && (
            <OrderOutcome order={order} error={submitError} onDismiss={handleDismissOutcome} />
          )}

          {!loadingProducts && !loadError && !order && !submitError && (
            <div className="layout">
              <div className="products-column">
                <div className="controls-row">
                  <div className="search-bar">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search products…"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  >
                    <option value="default">Sort: Default</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A–Z</option>
                    <option value="stock-desc">Stock: Most first</option>
                  </select>
                </div>

                <ProductList
                  products={paginatedProducts}
                  quantities={quantities}
                  onQuantityChange={handleQuantityChange}
                  onAdd={handleAdd}
                  fieldError={fieldError}
                  fieldErrorProductId={fieldErrorProductId}
                  cartQuantities={cartQuantities}
                />
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
              <Cart
                items={cart}
                products={products}
                onRemove={handleRemove}
                onSubmit={handleSubmit}
                submitting={submitting}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

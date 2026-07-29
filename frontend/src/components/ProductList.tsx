import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useDebounce } from '../hooks/useDebounce';

interface Props {
  products: Product[];
  quantities: Record<string, string>;
  onQuantityChange: (productId: string, value: string) => void;
  onAdd: (productId: string) => void;
  fieldError?: string | null;
  fieldErrorProductId?: string | null;
  cartQuantities: Record<string, number>;
}

function StockBadge({ remaining }: { remaining: number }) {
  if (remaining === 0) {
    return <span className="badge badge-out">Out of stock</span>;
  }
  if (remaining <= 5) {
    return <span className="badge badge-low">Only {remaining} left</span>;
  }
  return <span className="badge badge-ok">{remaining} in stock</span>;
}

interface CardProps {
  product: Product;
  quantityValue: string;
  onQuantityChange: (productId: string, value: string) => void;
  onAdd: (productId: string) => void;
  hasSubmitError: boolean;
  submitErrorMessage?: string | null;
  remaining: number;
}

function ProductCard({
  product,
  quantityValue,
  onQuantityChange,
  onAdd,
  hasSubmitError,
  submitErrorMessage,
  remaining,
}: CardProps) {
  const outOfStock = remaining <= 0;
  const quantity = Number(quantityValue) || 0;

  const debouncedValue = useDebounce(quantityValue, 400);
  let liveError: string | null = null;
  if (debouncedValue) {
    const parsed = Number(debouncedValue);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      liveError = 'Quantity must be a positive whole number.';
    } else if (parsed > remaining) {
      liveError = `Only ${remaining} available.`;
    }
  }

  const displayError = hasSubmitError ? submitErrorMessage : liveError;

  function step(delta: number) {
    const next = Math.min(Math.max(quantity + delta, 0), remaining);
    onQuantityChange(product.id, next === 0 ? '' : String(next));
  }

  return (
    <div className={`product-card ${outOfStock ? 'is-out' : ''}`}>
      <div className="product-card-top">
        <h3>{product.name}</h3>
        <StockBadge remaining={remaining} />
      </div>
      <div className="product-price">£{product.price.toFixed(2)}</div>

      <div className="product-card-bottom">
        <div className={`stepper ${outOfStock ? 'stepper-disabled' : ''}`}>
          <button
            type="button"
            aria-label={`Decrease quantity for ${product.name}`}
            onClick={() => step(-1)}
            disabled={outOfStock || quantity <= 0}
          >
            <Minus size={14} />
          </button>
          <input
            type="number"
            min={0}
            max={remaining || undefined}
            disabled={outOfStock}
            value={quantityValue}
            onChange={(e) => onQuantityChange(product.id, e.target.value)}
            placeholder="0"
            className={displayError ? 'input-error' : ''}
          />
          <button
            type="button"
            aria-label={`Increase quantity for ${product.name}`}
            onClick={() => step(1)}
            disabled={outOfStock || quantity >= remaining}
          >
            <Plus size={14} />
          </button>
        </div>
        <button
          type="button"
          className="add-button"
          disabled={outOfStock}
          onClick={() => onAdd(product.id)}
        >
          <ShoppingCart size={15} />
          Add
        </button>
      </div>

      {displayError && <p className="field-error">{displayError}</p>}
    </div>
  );
}

export function ProductList({
  products,
  quantities,
  onQuantityChange,
  onAdd,
  fieldError,
  fieldErrorProductId,
  cartQuantities,
}: Props) {
  if (products.length === 0) {
    return <p className="no-results">No products match your search.</p>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => {
        const alreadyInCart = cartQuantities[product.id] ?? 0;
        const remaining = product.stock - alreadyInCart;

        return (
          <ProductCard
            key={product.id}
            product={product}
            quantityValue={quantities[product.id] ?? ''}
            onQuantityChange={onQuantityChange}
            onAdd={onAdd}
            hasSubmitError={fieldErrorProductId === product.id}
            submitErrorMessage={fieldError}
            remaining={remaining}
          />
        );
      })}
    </div>
  );
}

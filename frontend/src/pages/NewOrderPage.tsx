import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import {
  Box, Typography, Autocomplete, TextField, Select, MenuItem,
  FormControl, Stack, Pagination,
} from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { Product, CartItem, OrderResult } from '../types';
import { fetchProducts, submitOrder, ApiRequestError } from '../api/client';
import { ProductList } from '../components/ProductList';
import { Cart } from '../components/Cart';
import { OrderOutcome } from '../components/OrderOutcome';
import { useDebounce } from '../hooks/useDebounce';

const searchFilterOptions = createFilterOptions<string>({ limit: 6 });

export function NewOrderPage() {
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'stock-desc'>('default');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  function loadProducts() {
    setLoadingProducts(true);
    fetchProducts()
      .then((data) => {
        setProducts(data);
        setLoadError(null);
        setQuantities((prev) => {
          const next = { ...prev };
          for (const p of data) {
            if (!(p.id in next) && p.stock > 0) next[p.id] = '1';
          }
          return next;
        });
      })
      .catch(() => setLoadError('Could not load products. Is the backend running?'))
      .finally(() => setLoadingProducts(false));
  }

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { setPage(1); }, [debouncedSearchTerm, sortBy]);

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
      setFieldError(`Only ${remaining} unit(s) of "${product.name}" are available (you already have ${alreadyInCart} in your order).`);
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
    setQuantities((prev) => ({ ...prev, [productId]: '1' }));
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
      if (err instanceof ApiRequestError) setSubmitError(err.message);
      else setSubmitError('Something went wrong while creating the order. Please try again.');
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
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'name-asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'stock-desc': result.sort((a, b) => b.stock - a.stock); break;
      default: break;
    }
    return result;
  }, [products, debouncedSearchTerm, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const cartQuantities = Object.fromEntries(cart.map((item) => [item.productId, item.quantity]));

  return (
    <>
      {loadingProducts && <Typography>Loading products…</Typography>}
      {loadError && <Typography color="error">{loadError}</Typography>}

      {!loadingProducts && !loadError && (order || submitError) && (
        <OrderOutcome order={order} error={submitError} onDismiss={handleDismissOutcome} />
      )}

      {!loadingProducts && !loadError && !order && !submitError && (
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 320px' }} gap={3} alignItems="start">
          <Box display="flex" flexDirection="column" gap={2} minWidth={0}>
            <Stack direction="row" gap={1.5} flexWrap="wrap">
              <Autocomplete
                freeSolo
                options={products.map((p) => p.name)}
                filterOptions={searchFilterOptions}
                inputValue={searchTerm}
                open={searchOpen}
                onOpen={() => {
                  if (searchTerm.trim().length > 0) setSearchOpen(true);
                }}
                onClose={() => setSearchOpen(false)}
                onInputChange={(_, newValue) => {
                  setSearchTerm(newValue);
                  setSearchOpen(newValue.trim().length > 0);
                }}
                clearIcon={<X size={14} />}
                sx={{ flex: '1 1 200px', minWidth: 0 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Search products…"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <Box display="flex" alignItems="center" pl={0.5} sx={{ color: 'text.secondary' }}>
                          <Search size={16} />
                        </Box>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        fontSize: '0.9rem',
                        '& fieldset': { borderColor: '#e7e9f0' },
                        '&:hover fieldset': { borderColor: '#e7e9f0' },
                      },
                    }}
                  />
                )}
              />

              <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e7e9f0' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#e7e9f0' },
                  }}
                >
                  <MenuItem value="default">Sort: Default</MenuItem>
                  <MenuItem value="price-asc">Price: Low to High</MenuItem>
                  <MenuItem value="price-desc">Price: High to Low</MenuItem>
                  <MenuItem value="name-asc">Name: A–Z</MenuItem>
                  <MenuItem value="stock-desc">Stock: Most first</MenuItem>
                </Select>
              </FormControl>
            </Stack>

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
              <Box display="flex" justifyContent="center" py={1}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, value) => setPage(value)}
                  shape="rounded"
                />
              </Box>
            )}
          </Box>

          <Cart
            items={cart}
            products={products}
            onRemove={handleRemove}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </Box>
      )}
    </>
  );
}


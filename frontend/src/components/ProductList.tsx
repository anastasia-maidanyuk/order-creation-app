import { useState } from 'react';
import { Minus, Plus, ShoppingCart, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  Box, Card, CardContent, Chip, IconButton, InputBase, Stack, Typography, Button, Modal,
} from '@mui/material';
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

function StockChip({ remaining }: { remaining: number }) {
  if (remaining === 0) return <Chip size="small" label="Out of stock" sx={{ bgcolor: '#eceef3', color: 'text.secondary' }} />;
  if (remaining <= 5) return <Chip size="small" label={`Only ${remaining} left`} color="warning" variant="outlined" />;
  return <Chip size="small" label={`${remaining} in stock`} color="success" variant="outlined" />;
}

// Full-screen lightbox: same image list + index as the small carousel, so
// opening it picks up exactly where the user was looking.
function ImageLightbox({
  images, alt, index, onIndexChange, onClose,
}: {
  images: string[];
  alt: string;
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const hasMultiple = images.length > 1;

  function prev(e: React.MouseEvent) {
    e.stopPropagation();
    onIndexChange(index === 0 ? images.length - 1 : index - 1);
  }
  function next(e: React.MouseEvent) {
    e.stopPropagation();
    onIndexChange(index === images.length - 1 ? 0 : index + 1);
  }

  return (
    <Modal open onClose={onClose} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box
        onClick={onClose}
        sx={{
          width: '100%', height: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', position: 'relative', outline: 'none', p: 2,
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute', top: 16, right: 16, bgcolor: 'rgba(255,255,255,0.15)',
            color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
          }}
        >
          <X size={22} />
        </IconButton>

        <Box
          component="img"
          src={images[index]}
          alt={alt}
          onClick={(e) => e.stopPropagation()}
          sx={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 2 }}
        />

        {hasMultiple && (
          <>
            <IconButton
              onClick={prev}
              sx={{
                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.15)', color: '#fff',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              }}
            >
              <ChevronLeft size={24} />
            </IconButton>
            <IconButton
              onClick={next}
              sx={{
                position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.15)', color: '#fff',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              }}
            >
              <ChevronRight size={24} />
            </IconButton>
          </>
        )}
      </Box>
    </Modal>
  );
}

function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const hasMultiple = images.length > 1;

  function prev(e: React.MouseEvent) {
    e.stopPropagation();
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }
  function next(e: React.MouseEvent) {
    e.stopPropagation();
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  return (
    <>
      <Box
        position="relative"
        onClick={() => setLightboxOpen(true)}
        sx={{
          width: '100%',
          aspectRatio: '4 / 3',
          borderRadius: 1.5,
          overflow: 'hidden',
          bgcolor: '#f0f1f5',
          cursor: 'zoom-in',
        }}
      >
        <Box
          component="img"
          src={images[index]}
          alt={alt}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />

        {hasMultiple && (
          <>
            <IconButton
              size="small"
              onClick={prev}
              sx={{
                position: 'absolute', top: '50%', left: 4, transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.85)', '&:hover': { bgcolor: '#fff' },
                width: 26, height: 26,
              }}
            >
              <ChevronLeft size={16} />
            </IconButton>
            <IconButton
              size="small"
              onClick={next}
              sx={{
                position: 'absolute', top: '50%', right: 4, transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.85)', '&:hover': { bgcolor: '#fff' },
                width: 26, height: 26,
              }}
            >
              <ChevronRight size={16} />
            </IconButton>

            <Stack
              direction="row"
              gap={0.5}
              justifyContent="center"
              sx={{ position: 'absolute', bottom: 6, left: 0, right: 0 }}
            >
              {images.map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 6, height: 6, borderRadius: '50%',
                    bgcolor: i === index ? '#fff' : 'rgba(255,255,255,0.5)',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.15)',
                  }}
                />
              ))}
            </Stack>
          </>
        )}
      </Box>

      {lightboxOpen && (
        <ImageLightbox
          images={images}
          alt={alt}
          index={index}
          onIndexChange={setIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
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
  product, quantityValue, onQuantityChange, onAdd, hasSubmitError, submitErrorMessage, remaining,
}: CardProps) {
  const outOfStock = remaining <= 0;
  const quantity = Number(quantityValue) || 0;

  const debouncedValue = useDebounce(quantityValue, 400);
  let liveError: string | null = null;
  if (!outOfStock && debouncedValue) {
    const parsed = Number(debouncedValue);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      liveError = 'Quantity must be a positive whole number.';
    } else if (parsed > remaining) {
      liveError = `Only ${remaining} available.`;
    }
  }
  const displayError = hasSubmitError ? submitErrorMessage : liveError;

  function step(delta: number) {
    const next = Math.min(Math.max(quantity + delta, 1), remaining);
    onQuantityChange(product.id, String(next));
  }

  return (
    <Card sx={{ opacity: outOfStock ? 0.7 : 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box p={1.5} pb={0}>
        <ImageCarousel images={product.images} alt={product.name} />
      </Box>

      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
          <Typography variant="subtitle1" fontWeight={600}>{product.name}</Typography>
          <StockChip remaining={remaining} />
        </Stack>

        <Typography variant="h5" fontWeight={700}>£{product.price.toFixed(2)}</Typography>

        <Box sx={{ mt: 'auto', pt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Stack direction="row" alignItems="center" border="1px solid #e7e9f0" borderRadius={1} sx={{ opacity: outOfStock ? 0.5 : 1 }}>
            <IconButton size="small" onClick={() => step(-1)} disabled={outOfStock || quantity <= 1}>
              <Minus size={14} />
            </IconButton>
            <InputBase
              type="number"
              value={outOfStock ? '' : quantityValue}
              disabled={outOfStock}
              onChange={(e) => onQuantityChange(product.id, e.target.value)}
              placeholder={outOfStock ? '0' : '1'}
              sx={{
                width: 42, textAlign: 'center', fontSize: '0.9rem',
                bgcolor: displayError ? '#fdecec' : 'transparent',
                '& input': { textAlign: 'center', p: '6px 0' },
              }}
            />
            <IconButton size="small" onClick={() => step(1)} disabled={outOfStock || quantity >= remaining}>
              <Plus size={14} />
            </IconButton>
          </Stack>
          <Button
            variant="contained"
            fullWidth
            disabled={outOfStock}
            onClick={() => onAdd(product.id)}
            startIcon={<ShoppingCart size={15} />}
            sx={{ height: 32 }}
          >
            Add
          </Button>
        </Box>

        <Typography
          variant="caption"
          color="error"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.2em',
            height: '2.4em',
            visibility: displayError ? 'visible' : 'hidden',
          }}
        >
          {displayError || '\u00A0'}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function ProductList({
  products, quantities, onQuantityChange, onAdd, fieldError, fieldErrorProductId, cartQuantities,
}: Props) {
  if (products.length === 0) {
    return <Typography color="text.secondary" textAlign="center" py={4}>No products match your search.</Typography>;
  }

  return (
    <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(220px, 1fr))" gap={2}>
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
    </Box>
  );
}

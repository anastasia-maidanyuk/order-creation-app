import { ShoppingBag, X } from 'lucide-react';
import { Box, Card, CardContent, Divider, IconButton, Stack, Typography, Button } from '@mui/material';
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
    return { ...item, name: product?.name ?? item.productId, price: product?.price ?? 0 };
  });

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const willDiscount = subtotal > 100;
  const estimatedTotal = willDiscount ? subtotal * 0.9 : subtotal;

  if (items.length === 0) {
    return (
      <Card sx={{ position: 'sticky', top: 24 }}>
        <CardContent sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
          <Box sx={{ width: 44, height: 44, mx: 'auto', mb: 1.5, borderRadius: '50%', bgcolor: '#eef0fd', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={22} />
          </Box>
          <Typography variant="h6" color="text.primary" fontWeight={700} gutterBottom>Your order</Typography>
          <Typography variant="body2">No items added yet. Pick a quantity and press "Add" on a product.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ position: 'sticky', top: 24 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom>Your order</Typography>

        <Stack divider={<Divider />} sx={{ mb: 2 }}>
          {lines.map((line) => (
            <Stack key={line.productId} direction="row" alignItems="center" gap={1} py={1.5}>
              <Box flex={1} minWidth={0}>
                <Typography variant="body2" fontWeight={600} noWrap>{line.name}</Typography>
                <Typography variant="caption" color="text.secondary">Qty {line.quantity}</Typography>
              </Box>
              <Typography variant="body2" fontWeight={600} whiteSpace="nowrap">
                £{(line.price * line.quantity).toFixed(2)}
              </Typography>
              <IconButton size="small" onClick={() => onRemove(line.productId)} aria-label={`Remove ${line.name}`}>
                <X size={15} />
              </IconButton>
            </Stack>
          ))}
        </Stack>

        <Box borderTop="1px solid #e7e9f0" pt={1.5} mb={2}>
          <Stack direction="row" justifyContent="space-between" py={0.5}>
            <Typography variant="body2">Subtotal</Typography>
            <Typography variant="body2">£{subtotal.toFixed(2)}</Typography>
          </Stack>
          {willDiscount && (
            <Stack direction="row" justifyContent="space-between" py={0.5}>
              <Typography variant="body2" color="success.main" fontWeight={600}>10% discount (over £100)</Typography>
              <Typography variant="body2" color="success.main" fontWeight={600}>
                -£{(subtotal - estimatedTotal).toFixed(2)}
              </Typography>
            </Stack>
          )}
          <Stack direction="row" justifyContent="space-between" pt={1} mt={0.5} borderTop="1px dashed #e7e9f0">
            <Typography fontWeight={700}>Total</Typography>
            <Typography fontWeight={700}>£{estimatedTotal.toFixed(2)}</Typography>
          </Stack>
        </Box>

        <Button variant="contained" fullWidth size="large" onClick={onSubmit} disabled={submitting}>
          {submitting ? 'Placing order…' : 'Place order'}
        </Button>
      </CardContent>
    </Card>
  );
}

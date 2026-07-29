import { CheckCircle2, XCircle } from 'lucide-react';
import { Box, Card, CardContent, Divider, Stack, Typography, Button } from '@mui/material';
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
      <Card sx={{ textAlign: 'center', p: 3, maxWidth: 480, mx: 'auto' }}>
        <CardContent>
          <Box sx={{ width: 52, height: 52, mx: 'auto', mb: 1.5, borderRadius: '50%', bgcolor: '#fdecec', color: 'error.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XCircle size={28} />
          </Box>
          <Typography variant="h6" fontWeight={700} gutterBottom>Order could not be created</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>{error}</Typography>
          <Button variant="contained" color="inherit" fullWidth onClick={onDismiss} sx={{ bgcolor: 'text.primary', color: '#fff', '&:hover': { bgcolor: '#333' } }}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ textAlign: 'center', p: 3, maxWidth: 480, mx: 'auto' }}>
      <CardContent>
        <Box sx={{ width: 52, height: 52, mx: 'auto', mb: 1.5, borderRadius: '50%', bgcolor: '#e6f7ef', color: 'success.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle2 size={28} />
        </Box>
        <Typography variant="h6" fontWeight={700}>Order created</Typography>
        <Typography variant="caption" color="text.secondary" mb={2} display="block">
          Order ID: {order!.orderId}
        </Typography>

        <Stack divider={<Divider />} textAlign="left" mb={2}>
          {order!.lines.map((line) => (
            <Stack key={line.productId} direction="row" justifyContent="space-between" py={0.75}>
              <Typography variant="body2">{line.name} × {line.quantity}</Typography>
              <Typography variant="body2">£{line.lineTotal.toFixed(2)}</Typography>
            </Stack>
          ))}
        </Stack>

        <Box textAlign="left" borderTop="1px solid #e7e9f0" pt={1.5} mb={2}>
          <Stack direction="row" justifyContent="space-between" py={0.5}>
            <Typography variant="body2">Subtotal</Typography>
            <Typography variant="body2">£{order!.subtotal.toFixed(2)}</Typography>
          </Stack>
          {order!.discountApplied && (
            <Stack direction="row" justifyContent="space-between" py={0.5}>
              <Typography variant="body2" color="success.main" fontWeight={600}>
                Discount ({order!.discountRate * 100}%)
              </Typography>
              <Typography variant="body2" color="success.main" fontWeight={600}>
                -£{(order!.subtotal - order!.total).toFixed(2)}
              </Typography>
            </Stack>
          )}
          <Stack direction="row" justifyContent="space-between" pt={1} mt={0.5} borderTop="1px dashed #e7e9f0">
            <Typography fontWeight={700}>Total charged</Typography>
            <Typography fontWeight={700}>£{order!.total.toFixed(2)}</Typography>
          </Stack>
        </Box>

        <Button variant="contained" fullWidth onClick={onDismiss}>Place another order</Button>
      </CardContent>
    </Card>
  );
}

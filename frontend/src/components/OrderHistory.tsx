import { useEffect, useState } from 'react';
import { History, RefreshCw, CheckCircle2, Package } from 'lucide-react';
import { Box, Card, CardContent, Chip, IconButton, Stack, Typography } from '@mui/material';
import { OrderResult } from '../types';
import { fetchOrders } from '../api/client';

export function OrderHistory() {
  const [orders, setOrders] = useState<OrderResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load(isManualRefresh = false) {
    if (isManualRefresh) setRefreshing(true); else setLoading(true);
    fetchOrders()
      .then((data) => {
        setOrders([...data].reverse());
        setError(null);
      })
      .catch(() => setError('Could not load order history.'))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }

  useEffect(() => { load(); }, []);

  if (loading) return <Typography>Loading order history…</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Card
      sx={{
        maxWidth: 720,
        border: '1px solid #e7e9f0',
        borderRadius: 3,
        boxShadow: '0 1px 2px rgba(20,24,40,0.04), 0 8px 24px rgba(20,24,40,0.05)',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
          <Stack direction="row" alignItems="center" gap={1.25}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              width={34}
              height={34}
              borderRadius="50%"
              bgcolor="#eef0fd"
              color="#4f5bd5"
            >
              <History size={17} />
            </Box>
            <Typography variant="h6" fontWeight={700}>Order History</Typography>
          </Stack>
          <IconButton
            size="small"
            onClick={() => load(true)}
            disabled={refreshing}
            aria-label="Refresh order history"
            sx={{
              border: '1px solid #e7e9f0',
              borderRadius: 2,
              '&:hover': { bgcolor: '#f3f5f9', borderColor: '#4f5bd5' },
            }}
          >
            <RefreshCw
              size={15}
              style={{ animation: refreshing ? 'spin 0.6s linear infinite' : 'none' }}
            />
          </IconButton>
        </Stack>

        {orders.length === 0 && (
          <Stack alignItems="center" gap={1} py={5} color="text.secondary">
            <Package size={28} />
            <Typography>No orders placed yet.</Typography>
          </Stack>
        )}

        <Stack gap={1.5}>
          {orders.map((order) => (
            <Box
              key={order.orderId}
              sx={{
                border: '1px solid #e7e9f0',
                borderRadius: 2.5,
                p: 2.25,
                transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
                '&:hover': {
                  borderColor: '#d7dae6',
                  boxShadow: '0 2px 8px rgba(20,24,40,0.06)',
                },
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1.25}
                flexWrap="wrap"
                gap={1}
              >
                <Stack direction="row" alignItems="center" gap={1}>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
                  >
                    #{order.orderId.slice(0, 8)}
                  </Typography>
                  <Chip
                    size="small"
                    icon={<CheckCircle2 size={13} />}
                    label="Completed"
                    sx={{
                      height: 22,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      bgcolor: '#e6f7ef',
                      color: '#1a9c6b',
                      '& .MuiChip-icon': { ml: '6px', color: '#1a9c6b' },
                    }}
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {new Date(order.createdAt).toLocaleString()}
                </Typography>
              </Stack>

              <Stack gap={0.4} mb={1.5}>
                {order.lines.map((line) => (
                  <Stack key={line.productId} direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.primary">
                      {line.name} <span style={{ color: '#9aa0ad' }}>× {line.quantity}</span>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      £{line.lineTotal.toFixed(2)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                pt={1.25}
                sx={{ borderTop: '1px dashed #e7e9f0' }}
              >
                {order.discountApplied ? (
                  <Chip
                    size="small"
                    label={`${order.discountRate * 100}% discount applied`}
                    sx={{
                      bgcolor: 'transparent',
                      border: '1px solid #b7e4cc',
                      color: '#1a9c6b',
                      fontWeight: 600,
                      fontSize: '0.72rem',
                    }}
                  />
                ) : (
                  <span />
                )}
                <Typography variant="h6" fontWeight={700}>
                  £{order.total.toFixed(2)}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Stack>
      </CardContent>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Card>
  );
}

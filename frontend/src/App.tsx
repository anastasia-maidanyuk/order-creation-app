import { Box, Container, Typography, Tabs, Tab } from '@mui/material';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { NewOrderPage } from './pages/NewOrderPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';

export default function App() {
  const location = useLocation();
  const activeTab = location.pathname === '/history' ? '/history' : '/';

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>Order Creation</Typography>
        <Typography color="text.secondary" mb={2}>Pick products and quantities, then place your order.</Typography>
        <Tabs value={activeTab} sx={{ minHeight: 0 }}>
          <Tab
            value="/"
            label="New Order"
            component={Link}
            to="/"
            sx={{ minHeight: 0, textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            value="/history"
            label="Order History"
            component={Link}
            to="/history"
            sx={{ minHeight: 0, textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>
      </Box>

      <Routes>
        <Route path="/" element={<NewOrderPage />} />
        <Route path="/history" element={<OrderHistoryPage />} />
      </Routes>
    </Container>
  );
}

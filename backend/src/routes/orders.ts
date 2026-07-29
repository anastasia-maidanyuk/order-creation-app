import { Router } from 'express';
import { createOrder, getOrders } from '../services/orderService';
import { OrderValidationError, CreateOrderRequest } from '../types';

export const ordersRouter = Router();

ordersRouter.post('/', (req, res) => {
  const body = req.body as CreateOrderRequest;

  try {
    const order = createOrder(body);
    res.status(201).json(order);
  } catch (err) {
    if (err instanceof OrderValidationError) {
      res.status(400).json({ message: err.message, productId: err.productId });
      return;
    }
    console.error('Unexpected error creating order:', err);
    res.status(500).json({ message: 'Something went wrong while creating the order.' });
  }
});

ordersRouter.get('/', (_req, res) => {
  res.json(getOrders());
});
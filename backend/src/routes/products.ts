import { Router } from 'express';
import { getProducts } from '../services/orderService';

export const productsRouter = Router();

productsRouter.get('/', (_req, res) => {
  res.json(getProducts());
});

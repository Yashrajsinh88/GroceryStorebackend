import express from 'express';
import { getAllOrders, getUserOrders, placeOrderCOD, placeOrderStripe, assignDeliveryBoy } from '../controllers/orderController.js';
import authSeller from '../middlewares/authSeller.js';
import authUser from '../middlewares/authUser.js';

const orderRouter = express.Router();

// User Routes
orderRouter.post('/cod', authUser, placeOrderCOD);
orderRouter.post('/stripe', authUser, placeOrderStripe);
orderRouter.post('/user', authUser, getUserOrders);

// Seller Routes
orderRouter.get('/seller', authSeller, getAllOrders);
// NEW: Assign Route
orderRouter.post('/assign', authSeller, assignDeliveryBoy);

export default orderRouter;
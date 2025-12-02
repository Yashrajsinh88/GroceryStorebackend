import express from 'express';
import { 
    registerDeliveryBoy, 
    loginDeliveryBoy, 
    getMyDeliveries, 
    completeDelivery,
    getAllDeliveryBoys
} from '../controllers/deliveryController.js';
import authDelivery from '../middlewares/authDelivery.js';
import authSeller from '../middlewares/authSeller.js';

const deliveryRouter = express.Router();

// Public Routes
deliveryRouter.post('/register', registerDeliveryBoy); // Admin create karega (postman se)
deliveryRouter.post('/login', loginDeliveryBoy);

// Protected Routes (Delivery App)
deliveryRouter.get('/my-orders', authDelivery, getMyDeliveries);
deliveryRouter.post('/complete', authDelivery, completeDelivery);

// Protected Routes (Seller Panel)
deliveryRouter.get('/list', authSeller, getAllDeliveryBoys);

export default deliveryRouter;
import express from 'express';
import { isSellerAuth, sellerLogin, sellerLogout } from '../controllers/sellerController.js';
import authSeller from '../middlewares/authSeller.js';

const sellerRouter = express.Router();

sellerRouter.post('/login', sellerLogin);
sellerRouter.get('/is-auth', authSeller, isSellerAuth);

// Logout ko POST rakhna standard practice hai (Accidental logout se bachne ke liye)
sellerRouter.post('/logout', sellerLogout);

export default sellerRouter;
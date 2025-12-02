import express from 'express';
import { upload } from '../configs/multer.js';
import authSeller from '../middlewares/authSeller.js';
import { addProduct, changeStock, productById, productList } from '../controllers/productController.js';

const productRouter = express.Router();

// 1. Add Product
// Auth pehle check karega, fir image upload karega (Security ke liye zaroori hai)
// upload.array('image') -> Frontend se field name 'image' hona chahiye
productRouter.post('/add', authSeller, upload.array('image'), addProduct);

// 2. List Products
productRouter.get('/list', productList);

// 3. Get Single Product
// POST isliye kiya kyunki controller req.body use kar raha hai
productRouter.post('/id', productById);

// 4. Change Stock
productRouter.post('/stock', authSeller, changeStock);

export default productRouter;
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';

import connectDB from './configs/db.js';
import connectCloudinary from './configs/cloudinary.js';

import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import productRoute from './routes/productRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import cartRouter from './routes/cartRoute.js';
import deliveryRouter from './routes/deliveryRoute.js';

import { stripeWebhooks } from './controllers/orderController.js';

const app = express();
const port = process.env.PORT || 4000;

const allowedOrigins = [
  'http://localhost:5173',
  'https://grocery-store-flax.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow REST clients / tools with no origin and your allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

// 🔹 CORS MUST BE BEFORE ROUTES
app.use(cors(corsOptions));

// 🔹 Stripe webhook needs raw body and must be BEFORE express.json
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// 🔹 After that, normal parsers
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => res.send('API is Working 🚀'));

app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRoute);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);
app.use('/api/cart', cartRouter);
app.use('/api/delivery', deliveryRouter);

const startServer = async () => {
  try {
    await connectDB();
    await connectCloudinary();
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
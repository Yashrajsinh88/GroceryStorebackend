import express from "express";
import authUser from "../middlewares/authUser.js"; // Fixed: Capital 'U' is important
import { updateCart } from "../controllers/cartController.js";

const cartRouter = express.Router();

cartRouter.post('/update', authUser, updateCart);

export default cartRouter;
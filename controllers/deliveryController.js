import DeliveryBoy from "../models/DeliveryBoy.js";
import Order from "../models/Order.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// 1. Register Delivery Boy (Postman/Admin se create karne ke liye)
export const registerDeliveryBoy = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        // Check exists
        const exists = await DeliveryBoy.findOne({ email });
        if (exists) return res.json({ success: false, message: "Delivery Boy already exists" });

        // Hash Password (Optional: agar simple rakhna hai to hash mat karo, but recommended hai)
        // Yahan simplicity ke liye direct save kar rahe hain ya hash kar sakte hain. 
        // Hum simple rakhte hain for now.
        
        const newBoy = await DeliveryBoy.create({
            name, email, password, phone
        });

        res.json({ success: true, message: "Delivery Boy Created", deliveryBoy: newBoy });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// 2. Login Delivery Boy
export const loginDeliveryBoy = async (req, res) => {
    try {
        const { email, password } = req.body;
        const deliveryBoy = await DeliveryBoy.findOne({ email });

        if (!deliveryBoy) {
            return res.json({ success: false, message: "Invalid email" });
        }

        if (password !== deliveryBoy.password) {
            return res.json({ success: false, message: "Invalid password" });
        }

        const token = jwt.sign({ id: deliveryBoy._id, role: 'delivery' }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ success: true, token, message: "Login Successful" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// 3. Get Orders Assigned to Me (For Delivery Boy)
export const getMyDeliveries = async (req, res) => {
    try {
        // Middleware se 'req.body.deliveryBoyId' milega
        const { deliveryBoyId } = req.body; 

        const orders = await Order.find({ deliveryBoy: deliveryBoyId })
            .populate("address")
            .sort({ createdAt: -1 });

        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// 4. Mark as Delivered (For Delivery Boy)
export const completeDelivery = async (req, res) => {
    try {
        const { orderId } = req.body;
        
        const order = await Order.findByIdAndUpdate(orderId, {
            status: 'Delivered',
            isPaid: true // COD hai to paid mark ho jayega
        }, { new: true });

        res.json({ success: true, message: "Order Delivered Successfully!" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// 5. Get All Delivery Boys (For Admin/Seller to assign)
export const getAllDeliveryBoys = async (req, res) => {
    try {
        const boys = await DeliveryBoy.find({});
        res.json({ success: true, deliveryBoys: boys });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
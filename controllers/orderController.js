import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ... (Baaki saare purane functions same rahenge: placeOrderCOD, placeOrderStripe, stripeWebhooks, getUserOrders) ...
// Main space bachane ke liye upar ke function repeat nahi kar raha hu, 
// Sirf naya function aur 'getAllOrders' update kar raha hu.
// AAPKO YE FULL CODE REPLACE KARNA HAI:

// ------------------------------------------------------------------
// Place Order : COD 
// ------------------------------------------------------------------
export const placeOrderCOD = async (req, res) => {
    try {
        const { userId, items, address } = req.body;
        if (!address || items.length === 0) return res.json({ success: false, message: "Invalid data" });
        let totalAmount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (product) totalAmount += product.offerPrice * item.quantity;
        }
        totalAmount += Math.floor(totalAmount * 0.02);
        await Order.create({ userId, items, amount: totalAmount, address, paymentType: "COD", status: "Order Placed" });
        await User.findByIdAndUpdate(userId, { cartItems: {} });
        return res.json({ success: true, message: "Order Placed Successfully" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// ------------------------------------------------------------------
// Place Order : Stripe 
// ------------------------------------------------------------------
export const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, address } = req.body;
        const { origin } = req.headers;
        if (!address || items.length === 0) return res.json({ success: false, message: "Invalid data" });
        let totalAmount = 0;
        let line_items = [];
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (product) {
                totalAmount += product.offerPrice * item.quantity;
                line_items.push({
                    price_data: { currency: "usd", product_data: { name: product.name }, unit_amount: Math.floor(product.offerPrice + (product.offerPrice * 0.02)) * 100 },
                    quantity: item.quantity,
                });
            }
        }
        totalAmount += Math.floor(totalAmount * 0.02);
        const order = await Order.create({ userId, items, amount: totalAmount, address, paymentType: "Online", isPaid: false });
        const session = await stripe.checkout.sessions.create({
            line_items: line_items, mode: "payment", success_url: `${origin}/loader?next=my-orders`, cancel_url: `${origin}/cart`,
            metadata: { orderId: order._id.toString(), userId: userId }
        });
        return res.json({ success: true, url: session.url });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// ------------------------------------------------------------------
// Stripe Webhook 
// ------------------------------------------------------------------
export const stripeWebhooks = async (request, response) => {
    const sig = request.headers["stripe-signature"];
    let event;
    try {
        event = stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
        return response.status(400).send(`Webhook Error: ${error.message}`);
    }
    switch (event.type) {
        case "payment_intent.succeeded": {
            const paymentIntent = event.data.object;
            const session = await stripe.checkout.sessions.list({ payment_intent: paymentIntent.id });
            if (session.data.length > 0) {
                const { orderId, userId } = session.data[0].metadata;
                await Order.findByIdAndUpdate(orderId, { isPaid: true, status: 'Order Placed' });
                await User.findByIdAndUpdate(userId, { cartItems: {} });
            }
            break;
        }
        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object;
            const session = await stripe.checkout.sessions.list({ payment_intent: paymentIntent.id });
            if (session.data.length > 0) {
                const { orderId } = session.data[0].metadata;
                await Order.findByIdAndDelete(orderId);
            }
            break;
        }
    }
    response.json({ received: true });
}

// ------------------------------------------------------------------
// Get User Orders
// ------------------------------------------------------------------
export const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await Order.find({ userId, $or: [{ paymentType: "COD" }, { isPaid: true }] })
        .populate("items.product").populate("address").sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// ------------------------------------------------------------------
// Get All Orders (Admin) - UPDATED to populate Delivery Boy
// ------------------------------------------------------------------
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({ $or: [{ paymentType: "COD" }, { isPaid: true }] })
        .populate("items.product")
        .populate("address")
        .populate("deliveryBoy") // Added: Delivery boy ka naam dekhne ke liye
        .sort({ createdAt: -1 });

        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// ------------------------------------------------------------------
// NEW FUNCTION: Assign Delivery Boy
// ------------------------------------------------------------------
export const assignDeliveryBoy = async (req, res) => {
    try {
        const { orderId, deliveryBoyId } = req.body;

        await Order.findByIdAndUpdate(orderId, {
            deliveryBoy: deliveryBoyId,
            status: 'Out for Delivery' // Status change kar diya
        });

        res.json({ success: true, message: "Order Assigned to Delivery Boy" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
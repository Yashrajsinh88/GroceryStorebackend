import User from "../models/User.js";

// ------------------------------------------------------------------
// Update User Cart : POST /api/cart/update
// ------------------------------------------------------------------
export const updateCart = async (req, res) => {
    try {
        const { userId, cartItems } = req.body;

        // Find user by ID and update cartItems
        await User.findByIdAndUpdate(userId, { cartItems });

        res.json({ success: true, message: "Cart Updated" });

    } catch (error) {
        console.error("Update Cart Error:", error.message);
        res.json({ success: false, message: error.message });
    }
}
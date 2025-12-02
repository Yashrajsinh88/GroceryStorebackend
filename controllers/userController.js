import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ------------------------------------------------------------------
// Register User : POST /api/user/register
// ------------------------------------------------------------------
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Validate fields
        if (!name || !email || !password) {
            return res.json({
                success: false,
                message: "Missing required fields",
            });
        }

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({
                success: false,
                message: "User already exists",
            });
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // 5. Generate JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 6. Set cookie (UPDATED SETTINGS FOR LOCALHOST)
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'lax' is better for localhost
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        console.log("Register Error:", error.message);
        return res.json({
            success: false,
            message: error.message,
        });
    }
};

// ------------------------------------------------------------------
// Login User : POST /api/user/login
// ------------------------------------------------------------------
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ success: false, message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set cookie (UPDATED SETTINGS FOR LOCALHOST)
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'lax' is better for localhost
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({ success: true, user: { email: user.email, name: user.name } });

    } catch (error) {
        console.log("Login Error:", error.message);
        return res.json({
            success: false,
            message: error.message,
        });
    }
};

// ------------------------------------------------------------------
// Check Auth : GET /api/user/is-auth
// ------------------------------------------------------------------
export const isAuth = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId).select("-password");
        return res.json({ success: true, user });
    } catch (error) {
        console.log("Auth Check Error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// ------------------------------------------------------------------
// Logout User : POST /api/user/logout
// ------------------------------------------------------------------
export const logout = async (req, res) => {
    try {
        // Clear cookie with same options
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        });
        return res.json({ success: true, message: "Logged Out" });
    } catch (error) {
        console.log("Logout Error:", error.message);
        res.json({ success: false, message: error.message });
    }
};
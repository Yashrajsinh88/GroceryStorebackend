import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.json({ success: false, message: 'Not Authorized Login Again' });
        }

        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        if (tokenDecode.id) {
            // Ye line sabse important hai refresh error rokne ke liye
            req.body = req.body || {}; 
            req.body.userId = tokenDecode.id;
        } else {
            return res.json({ success: false, message: 'Not Authorized Login Again' });
        }

        next();

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export default authUser;
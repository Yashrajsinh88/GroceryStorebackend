import jwt from 'jsonwebtoken';

const authDelivery = async (req, res, next) => {
    try {
        const { token } = req.headers;

        if (!token) {
            return res.json({ success: false, message: 'Not Authorized Login Again' });
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        
        if (token_decode.role === 'delivery') {
             // FIX: Agar req.body exist nahi karta (GET request me), to use empty object bana do
             req.body = req.body || {}; 
             
             req.body.deliveryBoyId = token_decode.id;
             next();
        } else {
             return res.json({ success: false, message: 'Not Authorized' });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export default authDelivery;
import Product from "../models/Product.js";
import { v2 as cloudinary } from "cloudinary";

// ------------------------------------------------------------------
// Add Product : POST /api/product/add
// ------------------------------------------------------------------
export const addProduct = async (req, res) => {
    try {
        const { name, description, price, offerPrice, category, instock } = JSON.parse(req.body.productData);
        
        const images = req.files;

        if (!images || images.length === 0) {
             return res.json({ success: false, message: "No images uploaded" });
        }

        // Upload images to Cloudinary
        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url;
            })
        );

        // Create Product in DB
        const productData = {
            name, 
            description, 
            price, 
            offerPrice, 
            category, 
            instock,
            image: imagesUrl 
        };

        await Product.create(productData);

        res.json({ success: true, message: "Product Added Successfully" });

    } catch (error) {
        console.error("Add Product Error:", error.message);
        res.json({ success: false, message: error.message });
    }
}

// ------------------------------------------------------------------
// Get All Products : GET /api/product/list
// ------------------------------------------------------------------
export const productList = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({ success: true, products });
    } catch (error) {
        console.error("List Product Error:", error.message);
        res.json({ success: false, message: error.message });
    }
}

// ------------------------------------------------------------------
// Get Single Product : POST /api/product/id
// ------------------------------------------------------------------
export const productById = async (req, res) => {
    try {
        const { id } = req.body;
        const product = await Product.findById(id);
        
        if(!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        res.json({ success: true, product });
    } catch (error) {
        console.error("Single Product Error:", error.message);
        res.json({ success: false, message: error.message });
    }
}

// ------------------------------------------------------------------
// Change Stock Status : POST /api/product/stock
// ------------------------------------------------------------------
export const changeStock = async (req, res) => {
    try {
        const { id, instock } = req.body;
        
        await Product.findByIdAndUpdate(id, { instock });
        
        res.json({ success: true, message: "Stock Updated" });
    } catch (error) {
        console.error("Change Stock Error:", error.message);
        res.json({ success: false, message: error.message });
    }
}
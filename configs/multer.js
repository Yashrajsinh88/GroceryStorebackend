import multer from "multer";

const storage = multer.diskStorage({
    // File ka original naam maintain rakhne ke liye configuration
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

export const upload = multer({ storage });
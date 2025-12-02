import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // Connection event listener
        mongoose.connection.on('connected', () => {
            console.log("Database Connected ✅");
        });

        // Database connection logic
        await mongoose.connect(`${process.env.MONGODB_URI}/grocerystore`);

    } catch (error) {
        console.error("Database Connection Error:", error.message);
        // Agar DB connect nahi hua, to process band karna safe rehta hai
        process.exit(1);
    }
};

export default connectDB;
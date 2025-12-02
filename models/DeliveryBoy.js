import mongoose from "mongoose";

const deliveryBoySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, default: 'Available' }, // Available or Busy
}, { minimize: false })

const DeliveryBoy = mongoose.models.deliveryBoy || mongoose.model('deliveryBoy', deliveryBoySchema)

export default DeliveryBoy;
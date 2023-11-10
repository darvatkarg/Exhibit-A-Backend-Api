import mongoose from 'mongoose'
const orderSchema: any = new mongoose.Schema({
    name: { type: String, default: null },
    address: { type: String },
    PINcode: { type: Number, default: 0 },
    state: { type: String, default: null },
    city: { type: String, default: null },
    country: { type: String, default: null },
    email: { type: String, default: null },
    phoneNumber: { type: String, default: null },
    bookId: { type: mongoose.Schema.Types.ObjectId, default: null },
    orderType: { type: Number, enum: [0, 1] },    // 0 - read online  || 1 - physical book
    isActive: { type: Boolean, default: true, },
    status: { type: Number, default: 0, enum: [0, 1] },   // 0 - pending || 1 - completed 
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    updatedBy: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true })

export const orderModel = mongoose.model<any>('Order', orderSchema)
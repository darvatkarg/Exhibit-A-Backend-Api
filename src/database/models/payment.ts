var mongoose = require('mongoose')
// import mongoose from 'mongoose'
const paymentSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId },
    book_type: { type: Number, default: 0, enum: [0, 1, 2, 3] }, // 0 - pdf, || 1 - video || 2 - audio || 3 - physical
    card: {
        type: { last4: { type: String }, brand: { type: String }, name: { type: String }, },
        default: { last4: null, brand: null, name: null, },
    },
    stripeCustomerId: { type: String, default: null },
    paymentMethod: { type: Number, default: 0, enum: [0, 1] }, // 0 - online payment || 1 - cash payment
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: "cardId", default: null },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true })

export const paymentModel = mongoose.model('payment', paymentSchema)
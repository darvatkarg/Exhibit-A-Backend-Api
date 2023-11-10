import mongoose from 'mongoose';

const userCardSchema: any = new mongoose.Schema({
    stripeCustomerId: { type: String, default: null },
    stripeCardId: { type: String, default: null },
    brand: { type: String, default: 'visa' },
    country: { type: String, default: 'india' },
    name: { type: String, default: null },
    cardNumber: { type: String, default: null },
    cvv: { type: String, default: null },
    expMonth: { type: String, default: null },
    expYear: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", require: true },
}, { timestamps: true })

export const cardModel = mongoose.model<any>('user_card', userCardSchema);
import mongoose from 'mongoose'

const discountSchema: any = new mongoose.Schema({
    discount: { type: Number, default: null },
    bookId: { type: mongoose.Schema.Types.ObjectId, default: null },
    isActive: { type: Boolean, default: true, },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    updatedBy: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true })

export const discountModel = mongoose.model<any>('discount', discountSchema)
import mongoose from 'mongoose'
const main_categorySchema: any = new mongoose.Schema({
    name: { type: String, default: null },
    //image: { type: String, default: null },
    isActive: { type: Boolean, default: true, },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    updatedBy: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true })

export const main_categoryModel = mongoose.model<any>('Main_category', main_categorySchema)
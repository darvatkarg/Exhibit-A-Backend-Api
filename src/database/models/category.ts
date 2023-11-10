import mongoose from 'mongoose'
const categorySchema: any = new mongoose.Schema({
    //image: { type: String, default: null },
    name: { type: String, default: null },
    main_categoryId: { type: mongoose.Schema.Types.ObjectId, default: null },
    isActive: { type: Boolean, default: true, },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    updatedBy: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true })

export const categoryModel = mongoose.model<any>('category', categorySchema)
import mongoose from 'mongoose';
const subCategorySchema = new mongoose.Schema({
    name: { type: String },
    //image: { type: String, default: null },
    isActive: { type: Boolean, default: true, },
    main_categoryId: { type: mongoose.Schema.Types.ObjectId },
    categoryId: { type: mongoose.Schema.Types.ObjectId },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    updatedBy: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true })

export const subCategoryModel = mongoose.model<any>('sub_category', subCategorySchema)
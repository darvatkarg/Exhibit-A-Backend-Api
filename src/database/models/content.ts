import mongoose from 'mongoose'
const contentSchema: any = new mongoose.Schema({
    subjectId: { type: mongoose.Schema.Types.ObjectId, default: null },
    title: { type: String, default: null },
    content: { type: Array, default: [] },
    video: { type: String, default: null },
    pdf: { type: String, default: null },
    sequence: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    updatedBy: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true })

export const contentModel = mongoose.model<any>('content', contentSchema)
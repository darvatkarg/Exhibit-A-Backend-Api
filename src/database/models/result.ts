import mongoose from 'mongoose'

const resultSchema: any = new mongoose.Schema({
    subjectId: { type: mongoose.Schema.Types.ObjectId, default: null },
    score: { type: Number },
    test_start_time: { type: Date },
    test_end_time: { type: Date },
    isApprove: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, },
    certificate: { type: String, default: null },
    certificate_is_create: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true })

export const resultModel = mongoose.model<any>('result', resultSchema)
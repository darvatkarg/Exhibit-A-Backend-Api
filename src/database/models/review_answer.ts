import mongoose from 'mongoose'
const reviewAnswerSchema: any = new mongoose.Schema({
    subjectId: { type: mongoose.Schema.Types.ObjectId },
    question: {
        type: [
            { questionId: { type: mongoose.Schema.Types.ObjectId }, ans: { type: String, default: null } }
        ], default: []
    },
    isActive: { type: Boolean, default: true, },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    updatedBy: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true })

export const reviewAnswerModel = mongoose.model('review_answer', reviewAnswerSchema)
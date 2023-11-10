import mongoose from 'mongoose'
const feedbackAnswerSchema: any = new mongoose.Schema({
    subjectId: { type: mongoose.Schema.Types.ObjectId },
    question: {
        type: [
            { questionId: { type: mongoose.Schema.Types.ObjectId }, question: { type: String, default: null }, ans: { type: String, default: null } }
        ], default: []
    },
    isActive: { type: Boolean, default: true, },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    updatedBy: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true })

export const feedbackAnswerModel = mongoose.model('feedback_answer', feedbackAnswerSchema)
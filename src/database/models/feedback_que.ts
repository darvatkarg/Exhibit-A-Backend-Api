var mongoose = require('mongoose')
// import mongoose from 'mongoose'
const feedbackQuestionSchema = new mongoose.Schema({
    question: { type: String },
    option: { type: Array, default: [] },
    questionType: { type: Number, default: 0, enum: [0, 1] }, // 0-option || 1-input
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true })

export const feedbackQuestionModel = mongoose.model('feedback_question', feedbackQuestionSchema)
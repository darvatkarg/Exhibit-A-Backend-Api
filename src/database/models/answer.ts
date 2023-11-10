var mongoose = require('mongoose')
// import mongoose from 'mongoose'
const answerSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, default: null },
    subjectId: { type: mongoose.Schema.Types.ObjectId, default: null },
    answer: { type: String, default: null },
    isAnswerTrue: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true })

export const answerModel = mongoose.model('answer', answerSchema)
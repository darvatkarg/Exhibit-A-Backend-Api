var mongoose = require('mongoose')
// import mongoose from 'mongoose'
const reviewQuestionSchema = new mongoose.Schema({
    question: { type: String },
    option: { type: Array },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true })

export const reviewQuestionModel = mongoose.model('review_question', reviewQuestionSchema)
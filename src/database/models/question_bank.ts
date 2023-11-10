var mongoose = require('mongoose')
// import mongoose from 'mongoose'
const question_bankSchema = new mongoose.Schema({
    subjectId: { type: mongoose.Schema.Types.ObjectId, default: null },
    question: { type: String },
    option: { type: Array },
    answer: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true })

export const question_bankModel = mongoose.model('question_bank', question_bankSchema)
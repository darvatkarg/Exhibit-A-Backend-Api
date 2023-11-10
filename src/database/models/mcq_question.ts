var mongoose = require('mongoose')
// import mongoose from 'mongoose'
const questionSchema = new mongoose.Schema({
    topicId: { type: mongoose.Schema.Types.ObjectId, default: null },
    question: { type: String },
    option: { type: Array },
    answer: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true })

export const questionModel = mongoose.model('mcq_question', questionSchema)
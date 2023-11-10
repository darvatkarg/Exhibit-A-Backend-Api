var mongoose = require('mongoose')
// import mongoose from 'mongoose'
const theory_questionSchema = new mongoose.Schema({
    topicId: { type: mongoose.Schema.Types.ObjectId, default: null },
    question: { type: String },
    answer: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true })

export const theory_questionModel = mongoose.model('theory_question', theory_questionSchema)
var mongoose = require('mongoose')
// import mongoose from 'mongoose'
const testSchema = new mongoose.Schema({
    subjectId: { type: mongoose.Schema.Types.ObjectId, default: null },
    title: { type: String },
    number_question: { type: Number, default: 0 },
    duration: { type: Number, default: null },
    marks: { type: Number, default: 0 },
    type: { type: Number, default: 0, enum: [0, 1, 2] },       //0 - mcq || 1 - theory || 2 - computer
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true })

export const testModel = mongoose.model('test', testSchema)
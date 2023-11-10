var mongoose = require('mongoose')
// import mongoose from 'mongoose'
const training_optionSchema = new mongoose.Schema({
    optionType: { type: Number },
    subjectId: { type: mongoose.Schema.Types.ObjectId, default: null },
    isActive: { type: Boolean, default: true },
    isUserBatch: { type: Boolean, default: false },
    isFormUploaded: { type: Boolean, default: false },
    isExamCompleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true })

export const training_optionModel = mongoose.model('training_option', training_optionSchema)
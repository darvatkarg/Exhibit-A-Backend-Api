var mongoose = require('mongoose')
// import mongoose from 'mongoose'
const training_typeSchema = new mongoose.Schema({
    name: { type: String, default: null },
    description: { type: Array, default: [] },
    optionType: { type: Number },       //0 - recorded || 1 - live || 2 - physical
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true })

export const training_typeModel = mongoose.model('training_type', training_typeSchema)
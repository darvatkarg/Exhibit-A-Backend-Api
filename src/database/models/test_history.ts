var mongoose = require('mongoose')
// import mongoose from 'mongoose'
const test_historySchema = new mongoose.Schema({
    testId: { type: mongoose.Schema.Types.ObjectId, default: null },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true })

export const test_historyModel = mongoose.model('test_history', test_historySchema)
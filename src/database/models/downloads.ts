var mongoose = require('mongoose')

const downloadSchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId },
    isActive: { type: Boolean, default: true },
    isRead: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId },

}, { timestamps: true })

export const downloadModel = mongoose.model('download', downloadSchema)
var mongoose = require('mongoose')
// import mongoose from 'mongoose'
const favoriteSchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },

}, { timestamps: true })

export const favoriteModel = mongoose.model('favorite', favoriteSchema)
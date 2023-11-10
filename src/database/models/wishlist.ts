var mongoose = require('mongoose')
// import mongoose from 'mongoose'
const wishlistSchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },

}, { timestamps: true })

export const wishlistModel = mongoose.model('wishlist', wishlistSchema)
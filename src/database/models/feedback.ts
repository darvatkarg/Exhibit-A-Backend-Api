var mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId, default: null },
    feedback_rating: { type: Number, default: 0, enum: [1, 2, 3, 4, 5] },
    // quality: { type: Number, default: 0, enum: [1, 2, 3, 4, 5] },
    // price: { type: Number, default: 0, enum: [1, 2, 3, 4, 5] },
    comment: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },

}, { timestamps: true })

export const feedbackModel = mongoose.model('feedback', feedbackSchema)
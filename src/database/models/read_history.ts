import mongoose from 'mongoose'

const librarySchema: any = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId, default: null },
    isActive: { type: Boolean, default: true, },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },

}, { timestamps: true })

export const libraryModel = mongoose.model<any>('library', librarySchema)
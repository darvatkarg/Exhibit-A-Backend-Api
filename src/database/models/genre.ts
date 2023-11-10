import mongoose from 'mongoose'
const genreSchema: any = new mongoose.Schema({
    //image: { type: String, default: null },
    name: { type: String, default: null },
    isActive: { type: Boolean, default: true, },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    updatedBy: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true })

export const genreModel = mongoose.model<any>('genre', genreSchema)
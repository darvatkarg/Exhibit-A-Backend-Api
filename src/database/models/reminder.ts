import mongoose from 'mongoose'

const reminderSchema: any = new mongoose.Schema({
    DateTime: { type: Date, default: Date.now() },
    //startTime: { type: String },
    weekDay: { type: Array, default: null },            // 0-6
    repeat: { type: Number, default: null },
    //  promptTime: { type: String, default: null },        //notification
    //hour: { type: Number },
    isActive: { type: Boolean, default: true, },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true })

export const reminderModel = mongoose.model<any>('reminder', reminderSchema)
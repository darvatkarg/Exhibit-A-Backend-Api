import mongoose from 'mongoose'

const schedule_time_slotSchema: any = new mongoose.Schema({
    date: { type: Date },
    time_slotId: { type: mongoose.Schema.Types.ObjectId, default: null },   //0 - 9:00-12:00 || 1- 12:00-3:00 || 2- 3:00-6:00
    subjectId: { type: mongoose.Schema.Types.ObjectId, default: null },   
    isActive: { type: Boolean, default: true, },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true })

export const schedule_time_slotModel = mongoose.model<any>('schedule_time_slot', schedule_time_slotSchema)
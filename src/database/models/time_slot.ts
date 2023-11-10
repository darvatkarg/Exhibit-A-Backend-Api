import mongoose from 'mongoose'

const time_slot_Schema: any = new mongoose.Schema({
    start_time: { type: String },
    end_time: { type: String },
    isActive: { type: Boolean, default: true, },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true })

export const time_slot_Model = mongoose.model<any>('time_slot', time_slot_Schema)
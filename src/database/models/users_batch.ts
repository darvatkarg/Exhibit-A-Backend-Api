import mongoose from 'mongoose'

const user_batchSchema: any = new mongoose.Schema({
    date: { type: Date, default: Date.now() },
    time_slotId: { type: mongoose.Schema.Types.ObjectId, default: null },   //0 - 9:00-12:00 || 1- 12:00-3:00 || 2- 3:00-6:00
    subjectId: { type: mongoose.Schema.Types.ObjectId, default: null },
    selectedUser: { type: [{ type: mongoose.Schema.Types.ObjectId }] },
    meetingURL: { type: String, default: null },
    meetingCode: { type: String, default: null },
    meetingId: { type: String, default: null },
    subject: { type: String, default: null },
    shortMeetingURL: { type: String, default: null },
    facultyId: { type: mongoose.Schema.Types.ObjectId },
    isFaculty: { type: Boolean, default: true },
    isStudent: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true })

export const user_batchModel = mongoose.model<any>('user_batch', user_batchSchema)
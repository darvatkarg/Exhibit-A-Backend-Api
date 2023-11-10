import mongoose from 'mongoose'
const assign_facultySchema: any = new mongoose.Schema({
    facultyId: { type: mongoose.Schema.Types.ObjectId },
    batchId: { type: mongoose.Schema.Types.ObjectId },
    time_slotId: { type: mongoose.Schema.Types.ObjectId },
    date: { type: Date, default: Date.now() },
    subjectId: { type: mongoose.Schema.Types.ObjectId },
    meetingURL: { type: String, default: null },
    meetingCode: { type: String, default: null },
    meetingId: { type: String, default: null },
    subject: { type: String, default: null },
    isFaculty: { type: Boolean, default: true },
    isStudent: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    updatedBy: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true })

export const assign_faculty_Model = mongoose.model<any>('assign_faculty', assign_facultySchema)
import mongoose from 'mongoose'
const course_subjectSchema: any = new mongoose.Schema({
    title: { type: String, default: null },
    description: { type: String, default: null },
    duration: { type: String, default: null },
    passing_marks: { type: Number, default: null },
    question_select: { type: Number, default: null },
    image: { type: String, default: null },
    pdf: { type: String, default: null },
    pdf_document: { type: String, default: null },
    ePub: { type: String, default: null },
    isActive: { type: Boolean, default: true, },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    updatedBy: { type: mongoose.Schema.Types.ObjectId },
    training_typeId: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "training_typeModel" }] },
    time_slotId: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "time_slot_Model" }] },
}, { timestamps: true })

export const course_subjectModel = mongoose.model<any>('course_subject', course_subjectSchema)
import mongoose from 'mongoose'
const topicSchema: any = new mongoose.Schema({
    topicName: { type: String, default: null },
    description: { type: String, default: null },
    duration: { type: String, default: null },
    passing_marks: { type: Number, default: null },
    question_select: { type: Number, default: null },
    topicType: { type: Number, default: 0, enum: [0, 1] }, // 0 - mcq || 1 - theory
    isActive: { type: Boolean, default: true, },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    updatedBy: { type: mongoose.Schema.Types.ObjectId },
    // training_typeId: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "training_typeModel" }] },
    // time_slotId: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "time_slot_Model" }] },
}, { timestamps: true })

export const topicModel = mongoose.model<any>('topic', topicSchema)
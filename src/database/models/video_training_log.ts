import mongoose from 'mongoose'

const video_training_logSchema: any = new mongoose.Schema({
    logLatestDate: { type: Date },
    logUserId: { type: mongoose.Schema.Types.ObjectId, default: null },
    subjectId: { type: mongoose.Schema.Types.ObjectId, default: null },
    topicCovered: { type: Number, default: null },
    isCompleted: { type: Boolean, default: false },
    isFormUploaded: { type: Boolean, default: false },
    isResult: { type: Boolean, default: false },
    // isActive: { type: Boolean, default: true, },
    // createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    // updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
})

export const video_training_logModel = mongoose.model<any>('video_training_log', video_training_logSchema)
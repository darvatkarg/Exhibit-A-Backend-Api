var mongoose = require('mongoose')

const formSchema = new mongoose.Schema({
    subjectId: { type: mongoose.Schema.Types.ObjectId, default: null },
    document_image: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true })

export const formModel = mongoose.model('form', formSchema)
var mongoose = require('mongoose')

const contactUsSchema = new mongoose.Schema({
    isActive: { type: Boolean, default: true },
    firstName: { type: String, default: null },
    email: { type: String, default: null },
    message: { type: String, default: null },
    isResponded: { type: Boolean, default: false },
    responseMessage: { type: [{ type: String }], default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "userModel" },
}, { timestamps: true })

export const contactUsModel = mongoose.model('contact_us', contactUsSchema)
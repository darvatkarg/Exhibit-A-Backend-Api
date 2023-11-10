var mongoose = require('mongoose')

const webSessionSchema = new mongoose.Schema({
    isActive: { type: Boolean, default: true },
    platform: { type: String, default: null },
    socketId: { type: String, default: null },
    webToken: { type: String, default: null },
    createdBy: { type: mongoose.Types.ObjectId, default: null }
}, { timestamps: true })

export const webSessionModel = mongoose.model('web_session', webSessionSchema)
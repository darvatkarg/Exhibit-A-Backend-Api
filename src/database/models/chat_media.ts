import mongoose from 'mongoose'
import { chat_historyModel } from './chat_history';
import { chat_ParticipantsModel } from './chat_Participants';


const chat_mediaCollection: any = new mongoose.Schema({
    media: { type: String },
    thumb: { type: String },
    // type: { type: String, validations: { isIn: ['text', 'image', 'video', 'audio', 'pdf'] } },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },

}, { timestamps: true })

export const chat_mediaModel = mongoose.model<any>('chat_media', chat_mediaCollection);

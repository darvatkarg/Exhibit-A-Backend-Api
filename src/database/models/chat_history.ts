import mongoose from 'mongoose'
import { chat_mediaModel } from './chat_media';
import { chat_Message_Receive_StatusModel } from './chat_Message_Receive_Status';
import { userModel } from './user';


const chat_historyCollection: any = new mongoose.Schema({
    room_id: { type: mongoose.Schema.Types.ObjectId, default: null, ref: "chat_roomModel" },
    sender_id: { type: mongoose.Schema.Types.ObjectId, default: null, ref: "userModel" },
    mediaId_id: { type: mongoose.Schema.Types.ObjectId, default: null, ref: "chat_mediaModel" },
    message_status_of_participantsId: { type: mongoose.Schema.Types.ObjectId, default: null, ref: "chat_Message_Receive_StatusModel" },
    content: { type: String },
    type: { type: String, validations: { isIn: ['text', 'image', 'video', 'audio', 'pdf', 'feed'] }, defaultsTo: 'text' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },

}, { timestamps: true })

export const chat_historyModel = mongoose.model<any>('chat_history', chat_historyCollection);

import mongoose from 'mongoose'
import { chat_historyModel } from './chat_history';
import { chat_ParticipantsModel } from './chat_Participants';
import { userModel } from './user';


const chatMessageReceiveStatusCollection: any = new mongoose.Schema({
    history_id: { type: mongoose.Schema.Types.ObjectId, default: null, ref: "chat_historyModel" },
    sender_id: { type: mongoose.Schema.Types.ObjectId, default: null, ref: "userModel" },
    receiver_id: { type: mongoose.Schema.Types.ObjectId, default: null, ref: "userModel" },
    status: { type: String, validations: { isIn: ['sent', 'delivered', 'read'] }, defaultsTo: 'sent' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true })

export const chat_Message_Receive_StatusModel = mongoose.model<any>('chat_Message_Receive_Status', chatMessageReceiveStatusCollection);

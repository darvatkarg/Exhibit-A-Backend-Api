import mongoose from 'mongoose'
import { chat_historyModel } from './chat_history';
import { chat_ParticipantsModel } from './chat_Participants';


const chatRoomCollection: any = new mongoose.Schema({
    // author_id: { model: 'app_userdetails' },
    participants: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "userModel" }] },
    is_group: { type: Number, default: 0 },
    history: { type: mongoose.Schema.Types.ObjectId, default: null, ref: "chat_historyModel" },
    // last_message_at: { type: 'ref', autoMigrations: { columnType: 'datetime' } },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },

}, { timestamps: true })

export const chat_roomModel = mongoose.model<any>('chat_room', chatRoomCollection);

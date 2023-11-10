import mongoose from 'mongoose'


const chat_ParticipantsCollection: any = new mongoose.Schema({
    room_id: { type: mongoose.Schema.Types.ObjectId, default: null },
    // user_id: { model: 'app_userdetails' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true })

export const chat_ParticipantsModel = mongoose.model<any>('chat_Participants', chat_ParticipantsCollection);

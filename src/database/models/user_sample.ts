import mongoose from "mongoose";
interface user extends mongoose.Document {
    name: String;
    email: String;
    password: String;
    authToken: String;
    userType: Number;
    createdAt: Date;
    updatedAt: Date;
    isBlock: Boolean;
}
const user_sampleSchema: any = new mongoose.Schema(
    {
        name: { type: String, default: null },
        email: { type: String, default: null },
        phoneNumber: { type: String, default: null },
        isActive: { type: Boolean, default: true },
        isBlock: { type: Boolean, default: false },
        createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    },
    { timestamps: true }
);

export const user_sampleModel = mongoose.model<any>("user_sample", user_sampleSchema);

import mongoose from 'mongoose'

const citySchema = new mongoose.Schema({
    stateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'states',
        required: true
    },
    city: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true, //true-YES,false-NO
        required: true
    }
}, {
    timestamps: true
})

export const cityModel = mongoose.model('city', citySchema)
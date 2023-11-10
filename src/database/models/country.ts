import mongoose from 'mongoose'

const countrySchema = new mongoose.Schema({
    country: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    shortName: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true, //true-YES,false-NO
        required: true
    }
},{ timestamps: true })

export const countryModel = mongoose.model('country', countrySchema);
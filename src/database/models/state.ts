let mongoose = require('mongoose')

const stateSchema = new mongoose.Schema({
    countryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'countries',
        required: true
    },
    state: {
        type: String,
        required: true
    },
    state_code: {
        type: String
    },
    status: {
        type: Boolean,
        default: true, //true-YES,false-NO
        required: true
    }
}, {
    timestamps: true
})

export const stateModel = mongoose.model('state', stateSchema)
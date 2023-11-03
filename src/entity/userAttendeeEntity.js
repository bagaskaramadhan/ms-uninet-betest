const mongoose = require('mongoose')
const Schema = mongoose.Schema
const UserAttendee = new Schema({
    username: {
        type: String,
        required: true
    },
    emailAddress: {
        type: String,
        required: true
    },
    identityNumber: {
        type: String,
        required: true
    },
    checkIn: {
        type: String
    },
    checkOut: {
        type: String
    },
    ipAddress: {
        type: String
    },
    longitude: {
        type: String
    },
    latitude: {
        type: String
    }
}, {
    versionKey: false
})
module.exports = mongoose.model('user-attendee', UserAttendee)
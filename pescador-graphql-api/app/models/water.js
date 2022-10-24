const mongoose = require('mongoose')
const user = require('./user')
const station = require('./station')

const waterSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        type: {
            type: String,
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: user
        },
        stations: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: station
        }] 
    }
)

module.exports = mongoose.model('Water', waterSchema)
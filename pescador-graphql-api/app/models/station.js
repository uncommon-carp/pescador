const mongoose = require('mongoose')

const stationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        usgsId: {
            type: String,
            required: true
        },
        long: {
            type: Number,
            required: true
        },
        lat: {
            type: Number,
            required: true
        }
    }
)

module.exports = mongoose.model('Station', stationSchema) 
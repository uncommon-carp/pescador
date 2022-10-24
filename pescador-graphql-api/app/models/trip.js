const mongoose = require('mongoose')
const water = require('./water')
const user = require('./user')

const tripSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true
        },
        weather: String,
        description: String,
        waterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: water,
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: user
        }
    },
    {
		timestamps: true,
		toObject: {
			// remove `userId` field when we call `.toObject`
			transform: (_doc, trip) => {
				delete trip.userId
				return trip
			},
		},
	}
)

module.exports = mongoose.model('Trip', tripSchema)
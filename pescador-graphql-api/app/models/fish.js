const mongoose = require('mongoose')
const user = require('./user')
const trip = require('./trip')

const fishSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: user
        },
        tripId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: trip
        },
        species: String,
        length: Number,
        weight: Number,
        description: String,
        caughtOn: String
    },
    {
		timestamps: true,
		toObject: {
			// remove `userId` field when we call `.toObject`
			transform: (_doc, fish) => {
				delete fish.userId
				return fish
			},
		},
	}
)

module.exports = mongoose.model('Fish', fishSchema)
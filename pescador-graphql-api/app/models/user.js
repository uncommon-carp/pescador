const mongoose = require('mongoose')
const station = require('./station')

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		hashedPassword: {
			type: String,
			required: true,
		},
		token: String,
		favoriteStation: {
            type: mongoose.Schema.Types.ObjectId,
			ref: station
        },
        firstName: {
			type: String
		},
        lastName: String,
        zipCode: {
			type: Number
		}
	},
	{
		timestamps: true,
		toObject: {
			// remove `hashedPassword` field when we call `.toObject`
			transform: (_doc, user) => {
				delete user.hashedPassword
				return user
			},
		},
	}
)

module.exports = mongoose.model('User', userSchema)

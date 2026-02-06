const { Schema, model } = require('mongoose')

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['root', 'admin', 'operator', 'guest'],
        default: 'operator',
    },
})

const UserModel = model('users', userSchema, 'users')

module.exports = UserModel

const { Schema, model } = require('mongoose')

const userSchema = new Schema({
    fullname: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: Schema.Types.ObjectId,
        ref: 'roles',
        required: true
    },
})

const UserModel = model('users', userSchema, 'users')

module.exports = UserModel

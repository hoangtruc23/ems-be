const { Schema, model } = require('mongoose')

const configFtpSchema = new Schema({
    host: {
        type: String,
        required: true,
    }, // IP hoặc domain
    port: {
        type: Number,
        default: 21,
    },
    username: {
        type: String,
        required: true,
    }, // user FTP
    password: {
        type: String,
        required: true,
    },
    fileType: {
        type: String,
    },
    folderName: {
        type: String,
    },
})

const ConfigFtpModel = model('configFtp', configFtpSchema, 'configFtp')

module.exports = ConfigFtpModel

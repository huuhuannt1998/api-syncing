const mongoose = require('mongoose')

const deviceSchema = mongoose.Schema(
    {
        deviceId: {
            type: String,
            require: [true, "Missing deviceID"]
        },
        deviceName: {
            type: String,
            require: [true, "Missing deviceName"]
        },
        deviceStatus: {
            type: String,
            require: [true, "Missing deviceStatus"]
        }
    },
    {
        timeStamps: true
    }
)

const Device = mongoose.model('Device', deviceSchema)

module.exports = Device;
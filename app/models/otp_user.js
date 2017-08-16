var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var OtpSchema = new mongoose.Schema({
    otp: Number,
    mobile: String,
    activeStatus: String
}, { timestamps: { type: Date, default: Date.now } });



module.exports = mongoose.model('OtpUser', OtpSchema);
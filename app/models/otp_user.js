var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var OtpSchema = new mongoose.Schema({
    otp: Number,
    mobile: Number
}, { timestamps: { type: Date, default: Date.now } });



module.exports = mongoose.model('OtpUser', OtpSchema);
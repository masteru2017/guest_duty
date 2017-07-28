var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var UserDataSchema = new mongoose.Schema({
    name: String,
    email: String,
    lat: Number,
    long: Number,
    landmark: String,
    mobile: Number,
    profession: String,
    gender: String,
    address: String,
    dob: String,
    userid: String
}, { timestamps: { type: Date, default: Date.now } });



module.exports = mongoose.model('UserData', UserDataSchema);
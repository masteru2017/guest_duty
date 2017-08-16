var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var UserDataSchema = new mongoose.Schema({
    name: String,
    email: String,
    latitude: Number,
    longitude: Number,
    landmark: String,
    mobile: String,
    profession: String,
    gender: String,
    address: String,
    dob: String,
    userID: String,
    activeStatus: String
}, { timestamps: { type: Date, default: Date.now } });



module.exports = mongoose.model('UserData', UserDataSchema);
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var HostSchema = new mongoose.Schema({
    hostname: String,
    email: String,
    lat: Number,
    long: Number,
    landmark: String,
    mobile: Number
}, { timestamps: { type: Date, default: Date.now } });



module.exports = mongoose.model('Host', HostSchema);
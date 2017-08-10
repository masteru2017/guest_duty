var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var UserMenuSchema = new mongoose.Schema({
    userID: String,
    itemDetail:[{}]
}, { timestamps: { type: Date, default: Date.now } });

module.exports = mongoose.model('UserMenuSchema', UserMenuSchema);
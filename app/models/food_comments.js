var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var foodCommentsSchema = new mongoose.Schema({
    foodId: String,
    userId: String,
    comment: String

}, { timestamps: { type: Date, default: Date.now } });

module.exports = mongoose.model('foodComments', foodCommentsSchema);
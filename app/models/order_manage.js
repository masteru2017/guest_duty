var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var OrderSchema = new mongoose.Schema({
    foodDetail: [{}],
    hostID: [String],
    eaterID:String,
    totalPrice:String,
    orderStatus:String,
    paymentID:String,
    activeStatus: String
}, { timestamps: { type: Date, default: Date.now } });

module.exports = mongoose.model('OrderSchema', OrderSchema);

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var itemDetail = [{
    itemName:String,
    itemQty:String,
    itemPrice:Number,
    itemUnit:String
}];

var OrderSchema = new mongoose.Schema({
    foodID: String,
    hostID: String,
    eaterID:String,
    items:itemDetail,
    totalPrice:String,
   orderStatus:String,
    paymentID:String
}, { timestamps: { type: Date, default: Date.now } });

module.exports = mongoose.model('OrderSchema', OrderSchema);

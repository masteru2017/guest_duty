var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var SaveFoodDetailSchema = new mongoose.Schema({
    userID: String,
    itemDetail: [{item_name:String,item_qty:Number,item_price:Number,item_unit:String}],
    foodName: String,
    latitude: Number,
    longitude: Number,
    placeType: String,
    foodType: [String],
    filterType: [String],
    forWhichTime: [String],
    forWhichDate:String,
    description: String,
    activeStatus: String
}, { timestamps: { type: Date, default: Date.now } });



module.exports = mongoose.model('SaveFoodDetail', SaveFoodDetailSchema);

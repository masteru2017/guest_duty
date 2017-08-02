var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var SaveFoodDetailSchema = new mongoose.Schema({
    userID: String,
    ItemDetails: [{item_name: String,item_qty:Number,item_price:Number,item_unit:String}],
    FoodName: String,
    latitude: Number,
    longitude: Number,
    placeType: String,
    foodType: [String],
    filterType: [String],
    ForWhichTime: [String],
    ForWhichDate: { type: Date },
    description: String,
}, { timestamps: { type: Date, default: Date.now } });



module.exports = mongoose.model('SaveFoodDetail', SaveFoodDetailSchema);
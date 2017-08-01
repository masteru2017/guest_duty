var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var SaveFoodDetailSchema = new mongoose.Schema({
    userID: String,
    ItemDetails: [{}],
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
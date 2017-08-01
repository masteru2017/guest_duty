var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var HostMenuSaveSchema = new mongoose.Schema({
    userID: String,
    MenuDetails: [{}],
    FoodName: String,
    latitude: Number,
    longitude: Number,
    placeType: String,
    foodType: [String],
    flavorType: [String],
    ForWhichTime: [String],
    ForWhichDate: { type: Date },
}, { timestamps: { type: Date, default: Date.now } });



module.exports = mongoose.model('HostMenuSave', HostMenuSaveSchema);
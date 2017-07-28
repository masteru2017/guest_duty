var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var HostMenuSaveSchema = new mongoose.Schema({
    hostId: String,
    MenuDetails: [String],
    FoodName: String,
    lat: Number,
    long: Number,
    placeType: String,
    foodType: [String],
    flavorType: [String],
    noOfPlates: Number,
    ForWhichTime: [String],
    FowWhichDate: { type: Date },
}, { timestamps: { type: Date, default: Date.now } });



module.exports = mongoose.model('HostMenuSave', HostMenuSaveSchema);
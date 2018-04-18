const mongoose = require('mongoose');
const schema = mongoose.Schema;

var FavoriteSchema = new schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        require : true
    },
    dishes : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Dish"
    }]
},{
    timestamps : true
});

module.exports = mongoose.model('Favorite', FavoriteSchema);
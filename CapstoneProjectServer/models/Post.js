/* const mongoose = require('mongoose');
var mongoose_delete = require('mongoose-delete');

let imageSchema = new mongoose.Schema({
    caption: {
        type: String,
    },
    timeCreated: {
        type: Date,
        default: () => Date.now(),
    },
    snippet: {
        type: String,
    },
    img: {
        type: String,
        default: 'placeholder.jpg',
    },
    userid: {
        type: String,
        default: 0
    }
});

imageSchema.plugin(mongoose_delete);

module.exports = mongoose.model("imagesPosts", imageSchema); */
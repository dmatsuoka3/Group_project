const mongoose = require('mongoose');
var mongoose_delete = require('mongoose-delete');

let imageSchema = new mongoose.Schema({

    userid: {
        type: String,
        default: 0
    },
    caption: {
        type: String,
    },
  
    img: {
        type: String,
        default: 'placeholder.jpg',
    },
  
    timeCreated: {
        type: Date,
        default: () => Date.now(),
    },
});

imageSchema.plugin(mongoose_delete);

module.exports = mongoose.model("imagesPosts", imageSchema);
const mongoose = require('mongoose');
var mongoose_delete = require('mongoose-delete');

let imageSchema = new mongoose.Schema({

    userId: {
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

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel"
    },

    postedBy: {
        type: String
    },

    profileImg: {
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
const mongoose = require('mongoose');
var mongoose_delete = require('mongoose-delete');

// const Schema = mongoose.Schema;

const imageSchema = new mongoose.Schema({
    
    user: {
        type: mongoose.Schema.Types.ObjectId,
        // ref: "UserModel"
        ref: "UserModel"
    },    
    
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

    // user: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "UserModel"
    // }
});

imageSchema.plugin(mongoose_delete);

module.exports = mongoose.model("imagesPosts", imageSchema);
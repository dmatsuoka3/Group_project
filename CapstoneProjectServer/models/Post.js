const mongoose = require('mongoose');
var mongoose_delete = require('mongoose-delete');

const { Schema } = mongoose;

const imageSchema = new mongoose.Schema({
    
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel'
    }, 
    
    caption: {
        type: String,
    },

    // user: {
    //     type: mongoose.Schema.Types.ObjectId,     
    //     ref: "UserModel"
    // }, 

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

    // postedBy: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "UserModel"
    // },

    postedBy: {
        type: String
    },

    profileImg: {
        type: String,
        default: 'placeholder.jpg'
    },
    
    // userid: {
    //     type: String,
    //     default: 0
    // }
});

// imageSchema.virtual("postedBy", {
//     ref: "UserModel",
//     localField: '_id',
//     foreignField: 'post',
// });

// imageSchema.set('toObject', { virtuals: true });
// imageSchema.set('toJSON', { virtuals: true });

imageSchema.plugin(mongoose_delete);

module.exports = mongoose.model("ImageModel", imageSchema);
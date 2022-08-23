const mongoose = require('mongoose');
var mongoose_delete = require('mongoose-delete');

// const Schema = mongoose.Schema;
const UserModel = require("./User");

const imageSchema = new mongoose.Schema({
    
    // user: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     // ref: "UserModel"
    //     ref: "UserModel"
    // },    
  
    // _id: mongoose.Schema.Types.ObjectId,
    
    caption: {
        type: String,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,     
        ref: "UserModel"
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

    // userId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     // type: Schema.Types.ObjectId,
    //     ref: "UserModel"
    // },    

    // user: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "UserModel"
    // }
});

imageSchema.plugin(mongoose_delete);

module.exports = mongoose.model("imagesPosts", imageSchema);
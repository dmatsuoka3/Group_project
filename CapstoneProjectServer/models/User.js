const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

// const Schema = mongoose.Schema;
// const ImageModel = require('./Post');

const userSchema = new mongoose.Schema(
    {
        // _id: mongoose.Schema.Types.ObjectId,

        name: {
            type: String,
            required: true
           
        },
        username: {
            type: String,
            required: true
           
        },
        email: {
            type: String,
            required: true
            
        },
        phone: {
            type: String,
           
        },
        password: {
            type: String,
            min: 6,
            max: 30
        },
    
        bio: {
            type: String,
            min: 3,
            max: 50
        },
        gender: {
            type: String
        },
    
        created: {
            type: Date,
            required: true,
            default: Date.now
        },

        posts: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "ImageModel"
        }]
    },

    // {
    //     timestamps: true,
    // // defined userSchema.virtual
    //     toJSON: {
    //         virtuals: true
    //     }
    // },

    //     toObject: { 
    //         virtuals: true 
    //     }
    // },

);
    

userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(passportLocalMongoose, {
//     findByUsername: (model, queryParameters) => model.findOne(queryParameters).populate('role', ['code']),
// });

// userSchema.virtual("posts", {
//     ref: "ImageModel",
//     localField: '_id',
//     foreignField: 'userId'
// });

module.exports = mongoose.model('users', userSchema);
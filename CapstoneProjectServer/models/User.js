const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const { Schema } = mongoose;

var profileSchema = new mongoose.Schema({
    img: {
        type: String,
        default: 'placeholder.jpg',
    },

    timeCreated: {
        type: Date,
        default: () => Date.now(),
    }
});

const userSchema = new mongoose.Schema(
    {
    //    _id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'ImageModel'
    // },

    // post: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'ImageModel'
    // },
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

        img: {
            type: String,
            default: 'placeholder.jpg',
        },
        // posts: [{
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'ImageModel'
        // }]

        // post: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "ImageModel"
        // }

        profile: {
            type: profileSchema
        }
    },

    //{
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
//     foreignField: 'user',
//     localField: '_id'
// });

// userSchema.set('toObject', { virtuals: true });
// userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('UserModel', userSchema);
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const { Schema } = mongoose;

const profileSchema = new mongoose.Schema({
    profileimg: {
        type: String,
        default: 'https://cdn.landesa.org/wp-content/uploads/default-user-image.png',
    },
    timeCreated: {
        type: Date,
        default: () => Date.now(),
    }
});



const imageSchema = new mongoose.Schema({
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

const userSchema = new mongoose.Schema(
    {
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
        
        profile: profileSchema,

        userPost: imageSchema
        
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
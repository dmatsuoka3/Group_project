const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
         
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
          
        }, 
        phone: {
            type: String,
        },
        gender: {
            type: String,
        },
        bio: {
            type: String,
        },
        website: {
            type: String,
        },
        password: {
            type: String,
        
        },
        profilePicture: {
            type: String,
            default: ""
        },
      
        followers: {
            type: Array,
            default: []
        },
        followings: {
            type: Array,
            default: []
        },

        likes: {
            type: Array,
            default: []
        }
    
    },
    {timestamps: true}
    
    );


userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('users', userSchema);
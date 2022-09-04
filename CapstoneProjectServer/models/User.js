const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            /* min: 3,
            max: 20,
            unique: true */
        },
        email: {
            type: String,
            required: true,
            /* max: 50,
            unique: true */
        }, 
        password: {
            type: String,
           /*  required: true, */
            /* min: 6 */
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
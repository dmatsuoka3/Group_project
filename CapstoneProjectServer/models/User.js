const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

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
        }
    
    });
    

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('users', userSchema);
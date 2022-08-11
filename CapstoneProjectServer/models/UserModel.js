const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
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
    passport: {
        type: String,
        required: true,
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

module.exports = mongoose.model("User", UserSchema);
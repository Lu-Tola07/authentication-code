const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        // unique: true
    },
    passWord: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isSuperAdmin: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

const userModel= mongoose.model("userAuth", userSchema);

module.exports = userModel;
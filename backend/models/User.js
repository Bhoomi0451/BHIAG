const mongoose= require("mongoose");
const userSchema= new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase:true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false
    },
    profileImage: {
        type: String,
        default: ""
    },

    bio: {
        type: String,
        default: "",
        maxlength: 200
    },

    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    favoriteSongs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song"
    }],

    isPrivate: {
        type: Boolean,
        default: false
    }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);

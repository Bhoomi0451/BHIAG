const mongoose = require("mongoose");
const songSchema= new mongoose.Schema({
    title: {
        type: String,
        required : true
    },
    artist:{
        type: String,
        required :true
    },
    album: {
        type: String,
        required : true
    },
    genre: {
        type: String,
        required : true
    },
    coverImage: {
        type: String,
        required : true
    },
    audioUrl: {
        type: String,
        required: true
    },
    duration:{
        type: Number,
        required: true
    },
    lyrics: {
        type: String
    }
    
});

songSchema.index({ title: 1 });
songSchema.index({ artist: 1 });
songSchema.index({ album: 1 });

module.exports=mongoose.model("Song",songSchema);
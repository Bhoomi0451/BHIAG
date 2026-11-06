const mongoose = require("mongoose");
const listeningHistorySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        song: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song",
            required: true
        },
        playedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);
listeningHistorySchema.index({ user: 1, playedAt: -1 });
module.exports = mongoose.model(
    "ListeningHistory",
    listeningHistorySchema
);

const mongoose = require("mongoose");
const activitySchema = new mongoose.Schema(
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
        type: {
            type: String,
            enum: ["LISTENING"],
            default: "LISTENING"
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);
activitySchema.index({ user: 1, createdAt: -1 });
module.exports = mongoose.model("Activity", activitySchema);

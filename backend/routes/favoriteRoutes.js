const express = require("express");
const User = require("../models/User");
const Song = require("../models/Song");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
router.post("/:songId", authMiddleware, async (req, res) => {
    try {
        const { songId } = req.params;
        const song = await Song.findById(songId);
        if (!song) {
            return res.status(404).json({
                message: "Song not found"
            });
        }
        const user = await User.findById(req.user._id);
        if (user.favoriteSongs.some(id => id.toString() === songId)) {
            return res.status(409).json({
                message: "Song already in favorites"
            });
        }
        user.favoriteSongs.push(songId);
        await user.save();
        res.status(200).json({
            message: "Song added to favorites",
            song
        });
    } catch (error) {
        console.log("Add favorite error:", error);
        res.status(500).json({
            message: "Failed to add favorite"
        });
    }
});
router.get("/", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("favoriteSongs");

        res.status(200).json({
            count: user.favoriteSongs.length,
            favorites: user.favoriteSongs
        });

    } catch (error) {
        console.log("Get favorites error:", error);

        res.status(500).json({
            message: "Failed to fetch favorites"
        });
    }
});
router.delete("/:songId", authMiddleware, async (req, res) => {
    try {
        const { songId } = req.params;
        const user = await User.findById(req.user._id);
        if (!user.favoriteSongs.some(id => id.toString() === songId)) {
            return res.status(404).json({
                message: "Song not found in favorites"
            });
        }
        user.favoriteSongs = user.favoriteSongs.filter(
            id => id.toString() !== songId
        );
        await user.save();
        res.status(200).json({
            message: "Song removed from favorites"
        });
    } catch (error) {
        console.log("Remove favorite error:", error);

        res.status(500).json({
            message: "Failed to remove favorite"
        });
    }
});

module.exports = router;

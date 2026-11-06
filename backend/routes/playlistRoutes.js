const express = require("express");
const Playlist = require("../models/Playlist");
const Song = require("../models/Song");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { name, description, coverImage } = req.body;
        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Playlist name is required"
            });
        }
        const playlist = await Playlist.create({
            name: name.trim(),
            description,
            coverImage,
            owner: req.user._id
        });
        res.status(201).json({
            message: "Playlist created successfully",
            playlist
        });
    } catch (error) {
        console.log("Create playlist error:", error);
        res.status(500).json({
            message: "Failed to create playlist"
        });
    }
});
router.get("/", authMiddleware, async (req, res) => {
    try {
        const playlists = await Playlist.find({
            owner: req.user._id
        }).populate("songs");
        res.status(200).json({
            count: playlists.length,
            playlists
        });
    } catch (error) {
        console.log("Get playlists error:", error);
        res.status(500).json({
            message: "Failed to fetch playlists"
        });
    }
});
router.post("/:playlistId/songs/:songId", authMiddleware, async (req, res) => {
    try {
        const { playlistId, songId } = req.params;
        const song = await Song.findById(songId);
        if (!song) {
            return res.status(404).json({
                message: "Song not found"
            });
        }
        const playlist = await Playlist.findOne({
            _id: playlistId,
            owner: req.user._id
        });
        if (!playlist) {
            return res.status(404).json({
                message: "Playlist not found"
            });
        }
        if (playlist.songs.some(id => id.toString() === songId)) {
            return res.status(409).json({
                message: "Song already exists in playlist"
            });
        }
        playlist.songs.push(songId);
        await playlist.save();
        res.status(200).json({
            message: "Song added to playlist",
            playlist
        });
    } catch (error) {
        console.log("Add song error:", error);
        res.status(500).json({
            message: "Failed to add song"
        });
    }
});
router.delete("/:playlistId/songs/:songId", authMiddleware, async (req, res) => {
    try {
        const { playlistId, songId } = req.params;
        const playlist = await Playlist.findOne({
            _id: playlistId,
            owner: req.user._id
        });
        if (!playlist) {
            return res.status(404).json({
                message: "Playlist not found"
            });
        }
        const songExists = playlist.songs.some(
            id => id.toString() === songId
        );
        if (!songExists) {
            return res.status(404).json({
                message: "Song not found in playlist"
            });
        }
        playlist.songs = playlist.songs.filter(
            id => id.toString() !== songId
        );
        await playlist.save();
        res.status(200).json({
            message: "Song removed from playlist",
            playlist
        });
    } catch (error) {
        console.log("Remove song error:", error);
        res.status(500).json({
            message: "Failed to remove song"
        });
    }
});
router.delete("/:playlistId", authMiddleware, async (req, res) => {
    try {
        const { playlistId } = req.params;
        const playlist = await Playlist.findOneAndDelete({
            _id: playlistId,
            owner: req.user._id
        });
        if (!playlist) {
            return res.status(404).json({
                message: "Playlist not found"
            });
        }
        res.status(200).json({
            message: "Playlist deleted successfully",
            playlist
        });
    } catch (error) {
        console.log("Delete playlist error:", error);
        res.status(500).json({
            message: "Failed to delete playlist"
        });
    }
});
module.exports = router;

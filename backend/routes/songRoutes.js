
const express = require("express");
const Song = require("../models/Song");

const router = express.Router();

// GET ALL SONGS
router.get("/", async (req, res) => {
    try {
        const songs = await Song.find();
        res.json(songs);
    } catch (error) {
        console.log("Error fetching songs:", error);
        res.status(500).json({
            message: "Failed to fetch songs",
            error: error.message
        });
    }
});

// SEARCH SONGS
router.get("/search", async (req, res) => {
    try {
        const query = req.query.q;

        if (!query || !query.trim()) {
            return res.status(400).json({
                message: "Please enter a search query"
            });
        }

        const songs = await Song.find({
            $or: [
                { title: { $regex: query, $options: "i" } },
                { artist: { $regex: query, $options: "i" } },
                { album: { $regex: query, $options: "i" } }
            ]
        });

        res.json({
            message: "Search results",
            count: songs.length,
            songs: songs
        });

    } catch (error) {
        console.log("Search error:", error);
        res.status(500).json({
            message: "Failed to search songs"
        });
    }
});

// GET SONG BY ID
router.get("/:id", async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);

        if (!song) {
            return res.status(404).json({
                message: "Song not found"
            });
        }

        res.json(song);

    } catch (error) {
        console.log("Error fetching song:", error);
        res.status(500).json({
            message: "Failed to fetch song",
            error: error.message
        });
    }
});

// ADD SONG
router.post("/", async (req, res) => {
    try {
        const song = new Song(req.body);
        const savedSong = await song.save();

        res.status(201).json(savedSong);

    } catch (error) {
        console.log("Error creating song:", error);
        res.status(500).json({
            message: "Failed to create song",
            error: error.message
        });
    }
});

// UPDATE SONG
router.put("/:id", async (req, res) => {
    try {
        const updatedSong = await Song.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedSong) {
            return res.status(404).json({
                message: "Song not found"
            });
        }

        res.json(updatedSong);

    } catch (error) {
        console.log("Error updating song:", error);
        res.status(500).json({
            message: "Failed to update song",
            error: error.message
        });
    }
});

// DELETE SONG
router.delete("/:id", async (req, res) => {
    try {
        const deletedSong = await Song.findByIdAndDelete(req.params.id);

        if (!deletedSong) {
            return res.status(404).json({
                message: "Song not found"
            });
        }

        res.json({
            message: "Song deleted successfully",
            song: deletedSong
        });

    } catch (error) {
        console.log("Error deleting song:", error);
        res.status(500).json({
            message: "Failed to delete song",
            error: error.message
        });
    }
});

module.exports = router;

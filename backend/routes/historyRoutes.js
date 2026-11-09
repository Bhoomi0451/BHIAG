const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const ListeningHistory = require("../models/ListeningHistory");
const Song = require("../models/Song");
const authMiddleware = require("../middleware/authMiddleware");
router.post("/:songId", authMiddleware, async (req, res) => {
    try {
        const { songId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(songId)) {
            return res.status(400).json({
                message: "Invalid song ID"
            });
        }
        const song = await Song.findById(songId);
        if (!song) {
            return res.status(404).json({
                message: "Song not found"
            });
        }
        const history = await ListeningHistory.create({
            user: req.user._id,
            song: songId
        });
        res.status(201).json({
            message: "Listening history recorded successfully",
            history
        });
    } catch (error) {
        res.status(500).json({
            message: "Error recording listening history",
            error: error.message
        });
    }
});
router.get("/", authMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        if (page < 1 || limit < 1 || limit > 50) {
            return res.status(400).json({
                message: "Invalid page or limit"
            });
        }
        const skip = (page - 1) * limit;
        const history = await ListeningHistory.find({
            user: req.user._id
        })
            .populate("song")
            .sort({ playedAt: -1 })
            .skip(skip)
            .limit(limit);
        const totalRecords = await ListeningHistory.countDocuments({
            user: req.user._id
        });
        res.status(200).json({
            currentPage: page,
            totalPages: Math.ceil(totalRecords / limit),
            totalRecords,
            history
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching listening history",
            error: error.message
        });
    }
});
router.get("/recent", authMiddleware, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        if (limit < 1 || limit > 50) {
            return res.status(400).json({
                message: "Limit must be between 1 and 50"
            });
        }
        const recentSongs = await ListeningHistory.aggregate([
            {
                $match: {
                    user: req.user._id
                }
            },
            {
                $sort: {
                    playedAt: -1,
                    _id: -1
                }
            },
            {
                $group: {
                    _id: "$song",
                    playedAt: {
                        $first: "$playedAt"
                    }
                }
            },
            {
                $sort: {
                    playedAt: -1
                }
            },
            {
                $limit: limit
            },
            {
                $lookup: {
                    from: "songs",
                    localField: "_id",
                    foreignField: "_id",
                    as: "song"
                }
            },
            {
                $unwind: "$song"
            },
            {
                $project: {
                    _id: 0,
                    song: 1,
                    playedAt: 1
                }
            }
        ]);
        res.status(200).json({
            count: recentSongs.length,
            recentlyPlayed: recentSongs
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching recently played songs",
            error: error.message
        });
    }
});
router.delete("/record/:historyId", authMiddleware, async (req, res) => {
    try {
        const { historyId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(historyId)) {
            return res.status(400).json({
                message: "Invalid history ID"
            });
        }
        const deletedHistory = await ListeningHistory.findOneAndDelete({
            _id: historyId,
            user: req.user._id
        });
        if (!deletedHistory) {
            return res.status(404).json({
                message: "History record not found"
            });
        }
        res.status(200).json({
            message: "Listening history record deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting history",
            error: error.message
        });
    }
});
router.delete("/", authMiddleware, async (req, res) => {
    try {
        const result = await ListeningHistory.deleteMany({
            user: req.user._id
        });
        res.status(200).json({
            message: "Listening history cleared successfully",
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({
            message: "Error clearing listening history",
            error: error.message
        });
    }
});
module.exports = router;

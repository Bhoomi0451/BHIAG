const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity");
const authMiddleware = require("../middleware/authMiddleware");
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
        const followingUsers = req.user.following || [];
        const activities = await Activity.find({
            user: { $in: followingUsers }
        })
            .populate("user", "username profileImage")
            .populate("song", "title artist album coverImage duration")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const totalRecords = await Activity.countDocuments({
            user: { $in: followingUsers }
        });
        res.status(200).json({
            currentPage: page,
            totalPages: Math.ceil(totalRecords / limit),
            totalRecords,
            activities
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching activity feed",
            error: error.message
        });
    }
});
module.exports = router;

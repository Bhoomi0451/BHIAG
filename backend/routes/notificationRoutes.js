const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Notification = require("../models/Notification");
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
        const notifications = await Notification.find({
            recipient: req.user._id
        })
            .populate("sender", "username profileImage")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const totalRecords = await Notification.countDocuments({
            recipient: req.user._id
        });
        const unreadCount = await Notification.countDocuments({
            recipient: req.user._id,
            isRead: false
        });
        res.status(200).json({
            currentPage: page,
            totalPages: Math.ceil(totalRecords / limit),
            totalRecords,
            unreadCount,
            notifications
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch notifications",
            error: error.message
        });
    }
});
router.put("/read-all", authMiddleware, async (req, res) => {
    try {
        const result = await Notification.updateMany(
            {
                recipient: req.user._id,
                isRead: false
            },
            {
                $set: { isRead: true }
            }
        );
        res.status(200).json({
            message: "All notifications marked as read",
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update notifications",
            error: error.message
        });
    }
});
router.put("/:notificationId/read", authMiddleware, async (req, res) => {
    try {
        const { notificationId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({
                message: "Invalid notification ID"
            });
        }
        const notification = await Notification.findOneAndUpdate(
            {
                _id: notificationId,
                recipient: req.user._id
            },
            {
                $set: { isRead: true }
            },
            {
                returnDocument: "after"
            }
        );
        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }
        res.status(200).json({
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update notification",
            error: error.message
        });
    }
});
router.delete("/:notificationId", authMiddleware, async (req, res) => {
    try {
        const { notificationId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({
                message: "Invalid notification ID"
            });
        }
        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            recipient: req.user._id
        });
        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }
        res.status(200).json({
            message: "Notification deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete notification",
            error: error.message
        });
    }
});
module.exports = router;

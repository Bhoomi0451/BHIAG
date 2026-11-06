const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.status(200).json({
            message: "Profile fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                profileImage: user.profileImage,
                followers: user.followers.length,
                following: user.following.length
            }
        });
    } catch (error) {
        console.log("Get profile error:", error);
        res.status(500).json({
            message: "Failed to fetch profile"
        });
    }
});
router.get("/:userId", authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }
        const user = await User.findById(userId)
            .select("username bio profileImage followers following createdAt");
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.status(200).json({
            message: "Profile fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                bio: user.bio,
                profileImage: user.profileImage,
                followersCount: user.followers.length,
                followingCount: user.following.length,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.log("Public profile error:", error);
        res.status(500).json({
            message: "Failed to fetch user profile"
        });
    }
});
router.put("/me", authMiddleware, async (req, res) => {
    try {
        const { username, bio, profileImage } = req.body;
        const updates = {};
        if (username !== undefined) {
            if (typeof username !== "string" || !username.trim()) {
                return res.status(400).json({
                    message: "Invalid username"
                });
            }
            updates.username = username.trim();
        }
        if (bio !== undefined) {
            if (typeof bio !== "string" || bio.length > 200) {
                return res.status(400).json({
                    message: "Bio must be a string of at most 200 characters"
                });
            }
            updates.bio = bio;
        }
        if (profileImage !== undefined) {
            if (typeof profileImage !== "string") {
                return res.status(400).json({
                    message: "Invalid profile image"
                });
            }
            updates.profileImage = profileImage;
        }
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "No profile details provided"
            });
        }
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            {
                returnDocument: "after",
                runValidators: true
            }
        );
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        console.log("Update profile error:", error);
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Username already exists"
            });
        }
        res.status(500).json({
            message: "Failed to update profile"
        });
    }
});
router.post("/:userId/follow", authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }
        if (userId === currentUserId.toString()) {
            return res.status(400).json({
                message: "You cannot follow yourself"
            });
        }
        const targetUser = await User.findById(userId);
        const currentUser = await User.findById(currentUserId);
        if (!targetUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        if (currentUser.following.some(id => id.toString() === userId)) {
            return res.status(409).json({
                message: "Already following this user"
            });
        }
        currentUser.following.push(targetUser._id);
        targetUser.followers.push(currentUser._id);
        await currentUser.save();
        await targetUser.save();
        res.status(200).json({
            message: "User followed successfully"
        });
    } catch (error) {
        console.log("Follow error:", error);
        res.status(500).json({
            message: "Failed to follow user"
        });
    }
});
router.delete("/:userId/follow", authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }
        if (userId === currentUserId.toString()) {
            return res.status(400).json({
                message: "You cannot unfollow yourself"
            });
        }
        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        if (!currentUser.following.some(id => id.toString() === userId)) {
            return res.status(409).json({
                message: "You are not following this user"
            });
        }
        currentUser.following = currentUser.following.filter(
            id => id.toString() !== userId
        );
        targetUser.followers = targetUser.followers.filter(
            id => id.toString() !== currentUserId.toString()
        );
        await currentUser.save();
        await targetUser.save();
        res.status(200).json({
            message: "User unfollowed successfully"
        });
    } catch (error) {
        console.log("Unfollow error:", error);

        res.status(500).json({
            message: "Failed to unfollow user"
        });
    }
});
module.exports = router;

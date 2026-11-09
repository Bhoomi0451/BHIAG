require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const songRoutes = require("./routes/songRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const authRoutes = require("./routes/authRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const playlistRoutes = require("./routes/playlistRoutes");
const profileRoutes = require("./routes/profileRoutes");
const historyRoutes = require("./routes/historyRoutes");
const app = express();
app.use(express.json());
app.use("/api/favorites", favoriteRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/history", historyRoutes);
app.get("/api/auth/me", authMiddleware, (req, res) => {
    res.json({
        message: "Authentication successful",
        user: {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email
        }
    });
});
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
    res.send("Welcome to BHIAG");
});
app.get("/about", (req, res) => {
    res.send("BIHAG - Music beyond listening");
});
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000
})
.then(() => {
    console.log("MongoDB connected");

    app.listen(5000, () => {
        console.log("Running on port 5000");
    });
})
.catch((error) => {
    console.log("MongoDB connection failed:", error.message);
});
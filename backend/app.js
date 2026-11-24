const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, ".env"),
});

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const apiRateLimiter = require("./middleware/apiRateLimiter")

// Routes
const taskRoutes = require("./routes/taskRoutes");
const tagRoutes = require("./routes/tagRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const inviteRoutes = require("./routes/inviteRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Middleware
const app = express();
// The production container receives public traffic through one Caddy proxy.
if (process.env.TRUST_SINGLE_PROXY === "true") {
    app.set("trust proxy", 1);
}

app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
}));
app.use(express.json());
app.use("/api", (_req, res, next) => {
    res.set("Cache-Control", "private, no-store");
    next();
});

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", apiRateLimiter);

// Connect CRUD route endpoints to the Express app
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/notifications", notificationRoutes);

// Define your local hosting port
const PORT = process.env.PORT || 5000;

// Start listening for requests
app.listen(PORT, () =>
    console.log(`🚀 Server successfully running on port ${PORT}`)
);

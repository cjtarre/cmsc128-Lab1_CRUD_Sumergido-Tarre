const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, ".env"),
});

const express = require("express");
const cors = require("cors");

// Routes
const taskRoutes = require("./routes/taskRoutes");
const tagRoutes = require("./routes/tagRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Connect CRUD route endpoints to the Express app
app.use("/api/tasks", taskRoutes);
app.use("/api/tags", tagRoutes);

// Define your local hosting port
const PORT = process.env.PORT || 5000;

// Start listening for requests
app.listen(PORT, () =>
    console.log(`🚀 Server successfully running on port ${PORT}`)
);

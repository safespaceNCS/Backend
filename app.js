const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // to parse JSON request bodies

// Route files
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const userRoutes = require("./routes/user");
const reportRoutes = require("./routes/report");
const courseRoutes = require("./routes/course");
const bulkUserRoutes = require("./routes/bulkUser");

// Use the routers
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/bulk-users", bulkUserRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to safe space");
});

// Export or listen
const PORT = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is listening at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};
start();

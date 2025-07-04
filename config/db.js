const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error("Database connection failed:", error.message)
    process.exit(1)
  }
}

// Mongoose connection events
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB")
})

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err)
})

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected")
})

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close()
  console.log("Mongoose connection closed through app termination")
  process.exit(0)
})

module.exports = connectDB

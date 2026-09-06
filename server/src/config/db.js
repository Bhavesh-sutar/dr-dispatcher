const mongoose = require("mongoose"); // Import the Mongoose library for interacting with MongoDB

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
}; // Define an asynchronous function to connect to the MongoDB database using Mongoose.

module.exports = connectDB; // Export the connectDB function for use in other parts of the application, 
// such as the server entry point.
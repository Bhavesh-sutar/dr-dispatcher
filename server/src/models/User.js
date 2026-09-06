const mongoose = require("mongoose"); // Import the Mongoose library for interacting with MongoDB


// Define a Mongoose schema for the User model, 
// specifying the structure and validation rules for 
// user documents in the MongoDB collection.
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields to the schema
  }
);


// Create a Mongoose model named "User" based on the userSchema
const User = mongoose.model("User", userSchema); 

// Export the User model for use in other parts of the application
module.exports = User;
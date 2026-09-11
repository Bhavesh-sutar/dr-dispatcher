const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    sequenceValue: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields to the schema
  },
);

module.exports = mongoose.model("Counter", counterSchema);

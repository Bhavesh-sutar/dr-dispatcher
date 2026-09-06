const mongoose = require("mongoose");

const datacenterSchema = new mongoose.Schema(
  {
    dcId: {
      type: String,
      required: true,
    },

    flexCalledMw: {
      type: Number,
      required: true,
      min: 0,
    },

    flexAvailableMw: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const drSchema = new mongoose.Schema(
  {
    drId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    eventType: {
      type: String,
      required: true,
      enum: ["DR", "EEA"],
    },

    date: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["Planned", "In-progress", "Completed"],
    },

    flexCalledMw: {
      type: Number,
      required: true,
      min: 0,
    },

    flexAvailableMw: {
      type: Number,
      required: true,
      min: 0,
    },

    actions: {
      type: [String],
      default: [],
    },

    optimized: {
      type: [String],
      default: [],
    },

    submitted: {
      type: [String],
      default: [],
    },

    datacenters: {
      type: [datacenterSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DR", drSchema, "drs");
const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    passengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null
    },

    pickupLocation: {
      type: String,
      default: "Airport"
    },

    // degmada passenger-ka doortay
    district: {
      type: String,
      required: true,
      trim: true
    },

    // location faahfaahsan (optional)
    exactLocation: {
      type: String,
      default: ""
    },

    // hadda system-ku wali destination ayuu isticmaalaa
    destination: {
      type: String,
      required: true,
      trim: true
    },

    // Airport → degmada KM
    distance: {
      type: Number,
      default: 0
    },

    // KM × 0.5
    fare: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "accepted",
        "completed",
        "cancelled"
      ],
      default: "pending"
    },

    assignedAt: {
      type: Date,
      default: null
    },

    acceptedAt: {
      type: Date,
      default: null
    },

    completedAt: {
      type: Date,
      default: null
    },

    cancelledAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ride", rideSchema);
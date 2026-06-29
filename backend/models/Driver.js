const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    licenseNumber: {
      type: String,
      required: true,
      trim: true
    },
    carNumber: {
      type: String,
      required: true,
      trim: true
    },
    carModel: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "available" // Halkan si sax ah ayey default ugu tahay
    },
    // KAN KU DAR: Si darawalku u ogaado safarka hadda loo soo xiray ee uu u baahan yahay inuu Accept taabto
    currentTrip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride", 
      default: null
    },
    totalTripsToday: {
      type: Number,
      default: 0
    },
    lastAssignedAt: {
      type: Date,
      default: null
    },
    isApproved: {
      type: Boolean,
      default: false // Haddii kan uu false yahay, hubi in logic-gaaga uu fasaxayo darawalka
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", driverSchema);
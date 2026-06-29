const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Qofka loo dirayo ogeysiiska (Darawal ama Rakaab)
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Qofka ogeysiiska dhaliyay
    },
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true, // Safarka uu ogeysiisku ku saabsan yahay
    },
    title: {
      type: String,
      required: true, // Tusaale: "New Ride Assigned" ama "Driver Accepted Your Ride"
    },
    message: {
      type: String,
      required: true, // Qoraalka ogeysiiska oo faahfaahsan
    },
    type: {
      type: String,
      enum: ["driver", "passenger"],
      required: true, // Nooca ogeysiiska si frontend-ka loogu kala saaro
    },
    isRead: {
      type: Boolean,
      default: false, // Haddii uu qofku akhriyey iyo haddii kale
    },
  },
  { timestamps: true } // Wuxuu si otomaatig ah u dhalinayaa createdAt iyo updatedAt
);

module.exports = mongoose.model("Notification", notificationSchema);
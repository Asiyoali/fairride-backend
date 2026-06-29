const Driver = require("../models/Driver");
const Ride = require("../models/Ride");

/* =========================
   GET ALL DRIVERS
========================= */
const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate("userId", "name email phone role")
      .sort({ createdAt: -1 });

    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET MY DRIVER PROFILE
========================= */
const getMyDriverProfile = async (req, res) => {
  try {
    const driver = await Driver.findOne({
      userId: req.user._id
    }).populate(
      "userId",
      "name email phone role"
    );

    if (!driver) {
      return res.status(404).json({
        message: "Driver profile not found"
      });
    }

    res.json(driver);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/* =========================
   UPDATE DRIVER STATUS
========================= */
const updateDriverStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["available", "busy", "offline"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status"
      });
    }

    const driver = await Driver.findOne({
      userId: req.user._id
    });

    if (!driver) {
      return res.status(404).json({
        message: "Driver profile not found"
      });
    }

    if (!driver.isApproved) {
      return res.status(403).json({
        message: "Your driver account is not approved yet"
      });
    }

    driver.status = status;
    await driver.save();

    /* AUTO ASSIGN PENDING RIDE */
    if (status === "available") {
      const pendingRide = await Ride.findOneAndUpdate(
        {
          status: "pending",
          driverId: null
        },
        {
          driverId: driver._id,
          status: "assigned",
          assignedAt: new Date()
        },
        {
          sort: { createdAt: 1 },
          new: true
        }
      );

      if (pendingRide) {
        driver.status = "busy";
        driver.currentTrip = pendingRide._id;
        driver.lastAssignedAt = new Date();
        driver.totalTripsToday += 1;

        await driver.save();
      }
    }

    res.json({
      message: "Driver status updated successfully",
      driver
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/* =========================
   DRIVER TRIP HISTORY
========================= */
const getMyTrips = async (req, res) => {
  try {
    const driver = await Driver.findOne({
      userId: req.user._id
    });

    if (!driver) {
      return res.status(404).json({
        message: "Driver profile not found"
      });
    }

    const rides = await Ride.find({
      driverId: driver._id
    })
      .populate("passengerId", "name phone email")
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/* =========================
   GET PENDING RIDES
========================= */
const getPendingRides = async (req, res) => {
  try {
    const rides = await Ride.find({
      status: "pending"
    })
      .populate("passengerId", "name phone email")
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/* =========================
   CURRENT ASSIGNED RIDE
========================= */
const getCurrentAssignedRide = async (req, res) => {
  try {
    const driver = await Driver.findOne({
      userId: req.user._id
    }).populate({
      path: "currentTrip",
      populate: {
        path: "passengerId",
        select: "name phone email"
      }
    });

    if (!driver) {
      return res.status(404).json({
        message: "Driver profile not found"
      });
    }

    if (!driver.currentTrip) {
      return res.json({
        message: "No active ride assigned",
        ride: null
      });
    }

    res.json({
      message: "Current ride found",
      ride: driver.currentTrip
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getAllDrivers,
  getMyDriverProfile,
  updateDriverStatus,
  getMyTrips,
  getPendingRides,
  getCurrentAssignedRide
};
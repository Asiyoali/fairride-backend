const Ride = require("../models/Ride");
const Driver = require("../models/Driver");
const assignFairDriver = require("../utils/assignDriver");
// KAN AYAA CUSUB: Waxaa la soo xiray model-ka ogeysiisyada oo aan dhowaan abuuri doonno
const Notification = require("../models/Notification");

// Masaafada degmooyinka ilaa Airport-ka (KM)
const districtDistances = {
  "Abdiaziz": 13, "Bondhere": 10, "Dayniile": 16, "Dharkenley": 8,
  "Hamar Jajab": 7, "Hamar Weyne": 8, "Hodan": 6, "Howlwadaag": 8,
  "Karaan": 14, "Shangaani": 9, "Shibis": 11, "Waaberi": 4,
  "Wadajir": 7, "Wardhiigley": 9, "Yaaqshiid": 12, "Madiina": 14,
  "Garasbaaley": 18, "Heliwaa": 15
};

/* ========================================================
   1. REQUEST RIDE (OGEYSIIS KUU JIRA DARAWALKA NEW RIDE ASSIGNED)
======================================================== */
const requestRide = async (req, res) => {
  try {
    const { destination, pickupLocation, district, exactLocation } = req.body;

    if (!destination && !district) {
      return res.status(400).json({ message: "Destination or District is required" });
    }

    const selectedDistrict = district || destination;

    const distance = districtDistances[selectedDistrict] || 10; 
    const calculatedFare = distance * 0.5;

    const existingRide = await Ride.findOne({
      passengerId: req.user._id,
      status: { $in: ["pending", "assigned", "accepted"] }
    });

    if (existingRide) {
      return res.status(400).json({
        message: "You already have an active ride"
      });
    }

    const driver = await assignFairDriver();

    if (!driver) {
      const pendingRide = await Ride.create({
        passengerId: req.user._id,
        pickupLocation: pickupLocation || "Airport",
        destination: selectedDistrict,
        district: selectedDistrict,
        exactLocation: exactLocation || "",
        fare: calculatedFare, 
        status: "pending"
      });

      return res.status(201).json({
        message: "No driver available. Ride pending.",
        ride: pendingRide
      });
    }

    const ride = await Ride.create({
      passengerId: req.user._id,
      driverId: driver._id,
      pickupLocation: pickupLocation || "Airport",
      destination: selectedDistrict,
      district: selectedDistrict,
      exactLocation: exactLocation || "",
      fare: calculatedFare, 
      status: "assigned",
      assignedAt: new Date()
    });

    driver.status = "busy";
    driver.currentTrip = ride._id; 
    driver.totalTripsToday += 1;
    driver.lastAssignedAt = new Date();
    await driver.save();

    // ==================== KAN AYAA CUSUB: DRIVER NOTIFICATION ====================
    await Notification.create({
      recipientId: driver.userId, // Waxaa loo dirayaa darawalka (User account-kiisa)
      senderId: req.user._id,     // Waxaa ka soo baxay rakaabka dalbaday
      rideId: ride._id,
      title: "New Ride Assigned",
      message: `Waxaa laguu xilsaaray safar cusub oo ku socda ${selectedDistrict}. Lacagta: $${calculatedFare.toFixed(2)}`,
      type: "driver"
    });
    // =============================================================================

    const fullRide = await Ride.findById(ride._id)
      .populate("passengerId", "name phone email")
      .populate({
        path: "driverId",
        populate: { path: "userId", select: "name phone email" }
      });

    res.status(201).json({
      message: "Ride assigned successfully",
      ride: fullRide
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ========================================================
   2. GET MY RIDES
======================================================== */
const getMyRides = async (req, res) => {
  try {
    let rides = [];

    if (req.user.role === "admin") {
      rides = await Ride.find()
        .populate("passengerId", "name phone email")
        .populate({
          path: "driverId",
          populate: { path: "userId", select: "name phone email" }
        })
        .sort({ createdAt: -1 });
    }
    else if (req.user.role === "passenger") {
      rides = await Ride.find({ passengerId: req.user._id })
        .populate("passengerId", "name phone email")
        .populate({
          path: "driverId",
          populate: { path: "userId", select: "name phone email" }
        })
        .sort({ createdAt: -1 });
    }
    else if (req.user.role === "driver") {
      const driver = await Driver.findOne({ userId: req.user._id });
      if (!driver) return res.json([]);

      rides = await Ride.find({ driverId: driver._id })
        .populate("passengerId", "name phone email")
        .populate({
          path: "driverId",
          populate: { path: "userId", select: "name phone email" }
        })
        .sort({ createdAt: -1 });
    }

    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ========================================================
   3. ACCEPT RIDE (OGEYSIIS KUU JIRA RAKAABKA DRIVER ACCEPTED)
======================================================== */
const acceptRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate({
      path: "driverId",
      populate: { path: "userId", select: "name" }
    });
    
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    ride.status = "accepted";
    await ride.save();

    // ==================== KAN AYAA CUSUB: PASSENGER NOTIFICATION ====================
    const driverName = ride.driverId?.userId?.name || "Darawalkaaga";
    
    await Notification.create({
      recipientId: ride.passengerId,          // Waxaa loo dirayaa rakaabkii dalbaday
      senderId: req.user._id,                 // Waxaa u diray darawalka aqbalay
      rideId: ride._id,
      title: "Driver Accepted Your Ride",
      message: `${driverName} wuxuu aqbalay safarkaagii, wuxuu ku soo jiraa jidka!`,
      type: "passenger"
    });
    // ================================================================================

    res.json({ message: "Ride accepted", ride });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ========================================================
   4. COMPLETE RIDE (AUTOMATIC ASSIGN LOGIC JIRA)
======================================================== */
const completeRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    ride.status = "completed";
    ride.completedAt = new Date();
    ride.updatedAt = new Date(); 
    await ride.save();

    const driver = await Driver.findById(ride.driverId);

    if (driver) {
      const oldestPendingRide = await Ride.findOne({ status: "pending" }).sort({ createdAt: 1 });

      if (oldestPendingRide) {
        oldestPendingRide.driverId = driver._id;
        oldestPendingRide.status = "assigned";
        oldestPendingRide.assignedAt = new Date();
        
        if (!oldestPendingRide.district) {
          oldestPendingRide.district = oldestPendingRide.destination || "Hodan"; 
        }
        
        await oldestPendingRide.save();

        driver.status = "busy";
        driver.currentTrip = oldestPendingRide._id;
        driver.totalTripsToday += 1;
        driver.lastAssignedAt = new Date();
        await driver.save();

        // ==================== KAN AYAA CUSUB: DRIVER AUTOMATIC NOTIFICATION ====================
        await Notification.create({
          recipientId: driver.userId,
          senderId: oldestPendingRide.passengerId,
          rideId: oldestPendingRide._id,
          title: "New Ride Assigned",
          message: `Nidaamka ayaa si otomaatig ah kuugu soo xilsaaray safar cusub oo safka ku jiray!`,
          type: "driver"
        });
        // =======================================================================================

        return res.json({ 
          message: "Ride completed! A new waiting ride has been automatically assigned to you.", 
          ride 
        });
      } else {
        driver.status = "available";
        driver.currentTrip = null;
        await driver.save();
      }
    }

    res.json({ message: "Ride completed. You are now available for new rides.", ride });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ========================================================
   5. GET CURRENT RIDE
======================================================== */
const getCurrentRide = async (req, res) => {
  try {
    const ride = await Ride.findOne({
      passengerId: req.user._id,
      status: { $in: ["pending", "assigned", "accepted"] }
    })
      .populate("passengerId", "name phone email")
      .populate({
        path: "driverId",
        populate: { path: "userId", select: "name phone email" }
      });

    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ========================================================
   6. CANCEL RIDE 
======================================================== */
const cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    ride.status = "cancelled";
    await ride.save();

    if (ride.driverId) {
      await Driver.findByIdAndUpdate(ride.driverId, {
        status: "available",
        currentTrip: null
      });
    }

    res.json({ message: "Ride cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ========================================================
   7. REJECT RIDE 
======================================================== */
const rejectRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    if (ride.status !== "assigned") {
      return res.status(400).json({ message: "Only assigned rides can be rejected" });
    }

    if (ride.driverId) {
      const driver = await Driver.findById(ride.driverId);
      if (driver) {
        driver.status = "available";
        driver.currentTrip = null;
        if (driver.totalTripsToday > 0) {
          driver.totalTripsToday -= 1;
        }
        await driver.save();
      }
    }

    ride.driverId = null;
    ride.status = "pending";
    await ride.save();

    res.json({ message: "Ride rejected successfully and returned to queue" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  requestRide,
  getMyRides,
  getCurrentRide,
  acceptRide,
  completeRide,
  cancelRide,
  rejectRide
};
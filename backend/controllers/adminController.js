const User = require("../models/User");
const Driver = require("../models/Driver");
const Ride = require("../models/Ride");
const Rating = require("../models/Rating");

/* ========================================================
   1. ADMIN DASHBOARD (REVENUE & SYSTEM STATS + TOP DRIVER)
======================================================== */
const dashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPassengers = await User.countDocuments({ role: "passenger" });

    const totalDrivers = await Driver.countDocuments();
    const approvedDrivers = await Driver.countDocuments({ isApproved: true });
    const availableDrivers = await Driver.countDocuments({ status: "available" });

    const totalRides = await Ride.countDocuments();
    const completedRides = await Ride.countDocuments({ status: "completed" });
    const cancelledRides = await Ride.countDocuments({ status: "cancelled" });
    const pendingRides = await Ride.countDocuments({ status: "pending" });

    // Soo qaad dhammaan safarrada completed-ka ah
    const rides = await Ride.find({ status: "completed" });

    // Masaafada degmooyinka si safarrada hore ee aan lacagta lahayn loogu xisaabiyo
    const districtDistances = {
      "Abdiaziz": 13, "Bondhere": 10, "Dayniile": 16, "Dharkenley": 8,
      "Hamar Jajab": 7, "Hamar Weyne": 8, "Hodan": 6, "Howlwadaag": 8,
      "Karaan": 14, "Shangaani": 9, "Shibis": 11, "Waaberi": 4,
      "Wadajir": 7, "Wardhiigley": 9, "Yaaqshiid": 12, "Madiina": 14,
      "Garasbaaley": 18, "Heliwaa": 15
    };

    const getRideFare = (ride) => {
      if (ride.fare && ride.fare > 0) return ride.fare;
      const dist = districtDistances[ride.district] || districtDistances[ride.destination] || 10;
      return dist * 0.5;
    };

    // Total Revenue (Dakhliga Guud)
    const totalRevenue = rides.reduce((sum, ride) => sum + getRideFare(ride), 0);

    // Waqtiyada kala duwan ee xisaabinta
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const getRideDate = (ride) => {
      const rawDate = ride.completedAt || ride.updatedAt || ride.createdAt;
      return rawDate ? new Date(rawDate) : new Date();
    };

    // Revenue Filters
    const todayRevenue = rides.filter((ride) => getRideDate(ride) >= today).reduce((sum, ride) => sum + getRideFare(ride), 0);
    const weeklyRevenue = rides.filter((ride) => getRideDate(ride) >= weekAgo).reduce((sum, ride) => sum + getRideFare(ride), 0);
    const monthlyRevenue = rides.filter((ride) => getRideDate(ride) >= monthAgo).reduce((sum, ride) => sum + getRideFare(ride), 0);

    // ==================== XISAABINTA TOP DRIVER THIS WEEK ====================
    let weeklyRides = rides.filter((ride) => ride.driverId);

    const driverStats = {};

    weeklyRides.forEach((ride) => {
      const dId = ride.driverId.toString();
      if (!driverStats[dId]) {
        driverStats[dId] = {
          driverId: dId,
          trips: 0,
          earnings: 0
        };
      }
      driverStats[dId].trips += 1;
      driverStats[dId].earnings += getRideFare(ride);
    });

    let topDriver = { name: "No Driver Found", trips: 0, earnings: 0 };
    const statsArray = Object.values(driverStats);
    
    if (statsArray.length > 0) {
      let bestDriverStat = statsArray[0];
      statsArray.forEach((driver) => {
        if (driver.trips > bestDriverStat.trips) {
          bestDriverStat = driver;
        }
      });

      try {
        const driverDoc = await Driver.findById(bestDriverStat.driverId).populate("userId", "name");
        if (driverDoc && driverDoc.userId && driverDoc.userId.name) {
          topDriver = {
            name: driverDoc.userId.name,
            trips: bestDriverStat.trips,
            earnings: bestDriverStat.earnings
          };
        } else {
          topDriver = {
            name: "Driver ID: " + bestDriverStat.driverId.slice(-4),
            trips: bestDriverStat.trips,
            earnings: bestDriverStat.earnings
          };
        }
      } catch (err) {
        topDriver = {
          name: "Driver ID: " + bestDriverStat.driverId.slice(-4),
          trips: bestDriverStat.trips,
          earnings: bestDriverStat.earnings
        };
      }
    }

    res.json({
      totalUsers,
      totalPassengers,
      totalDrivers,
      approvedDrivers,
      availableDrivers,
      totalRides,
      completedRides,
      cancelledRides,
      pendingRides,
      todayRevenue,
      weeklyRevenue,
      monthlyRevenue,
      totalRevenue,
      topDriver
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ========================================================
   2. APPROVE DRIVER
======================================================== */
const approveDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    driver.isApproved = true;
    await driver.save();

    res.json({ message: "Driver approved successfully", driver });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ========================================================
   3. GET ALL DRIVERS
======================================================== */
const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ========================================================
   4. DELETE DRIVER & USER ACCOUNT
======================================================== */
const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    await User.findByIdAndDelete(driver.userId);
    await Driver.findByIdAndDelete(driver._id);

    res.json({ message: "Driver deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ========================================================
   5. GET ALL RIDES (HISTORY)
======================================================== */
const getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find()
      .populate("passengerId", "name phone email")
      .populate({
        path: "driverId",
        populate: { path: "userId", select: "name phone email" }
      })
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ========================================================
   6. GENERATE DRIVER & RIDE REPORTS
======================================================== */
const getReports = async (req, res) => {
  try {
    const drivers = await Driver.find().populate("userId", "name phone email");
    const rides = await Ride.find();
    const ratings = await Rating.find().populate("passengerId", "name");

    const driverReport = drivers.map((driver) => {
      const driverRides = rides.filter(
        (ride) => ride.driverId && ride.driverId.toString() === driver._id.toString()
      );

      const driverRatings = ratings.filter(
        (rating) => rating.driverId && rating.driverId.toString() === driver._id.toString()
      );

      const totalRatings = driverRatings.length;

      const averageRating =
        totalRatings > 0
          ? (driverRatings.reduce((sum, item) => sum + item.rating, 0) / totalRatings).toFixed(1)
          : 0;

      const latestComments = driverRatings
        .filter((item) => item.comment)
        .slice(0, 3)
        .map((item) => ({
          passenger: item.passengerId?.name || "Unknown Passenger",
          rating: item.rating,
          comment: item.comment
        }));

      return {
        driverId: driver._id,
        name: driver.userId?.name,
        phone: driver.userId?.phone,
        status: driver.status,
        isApproved: driver.isApproved,
        totalTripsToday: driver.totalTripsToday,
        allTimeTrips: driverRides.length,
        completedTrips: driverRides.filter((r) => r.status === "completed").length,
        cancelledTrips: driverRides.filter((r) => r.status === "cancelled").length,
        averageRating,
        totalRatings,
        latestComments
      };
    });

    res.json({
      message: "Reports generated successfully",
      driverReport
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ========================================================
   7. RESET TODAY'S TRIPS (CRON JOB OR MANUAL)
======================================================== */
const resetTodayTrips = async (req, res) => {
  try {
    await Driver.updateMany({}, { totalTripsToday: 0 });
    res.json({ message: "All drivers totalTripsToday reset to 0" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Hubi in dhammaan 7-da function ay halkan ku wada jiraan oo loo export-gareeyay si sax ah
module.exports = {
  dashboard,
  getDrivers,
  approveDriver,
  deleteDriver,
  getAllRides,
  getReports,
  resetTodayTrips
};
const Driver = require("../models/Driver");
const Ride = require("../models/Ride");

const assignFairDriver = async () => {
  try {
    const availableDrivers = await Driver.find({
      status: "available",
      isApproved: true
    })
      .sort({
        totalTripsToday: 1,
        lastAssignedAt: 1,
        createdAt: 1
      })
      .populate("userId", "name phone email");

    console.log("AVAILABLE DRIVERS:", availableDrivers.length);

    for (const driver of availableDrivers) {
      const activeRide = await Ride.findOne({
        driverId: driver._id,
        status: {
          $in: ["assigned", "accepted"]
        }
      });

      if (!activeRide) {
        console.log(
          "ASSIGNED DRIVER:",
          driver.userId?.name || driver._id
        );

        return driver;
      }
    }

    console.log("NO FREE DRIVER FOUND");

    return null;
  } catch (error) {
    console.log("ASSIGN DRIVER ERROR:", error);
    return null;
  }
};

module.exports = assignFairDriver;
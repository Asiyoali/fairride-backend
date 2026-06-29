const express = require("express");

const {
  getAllDrivers,
  getMyDriverProfile,
  updateDriverStatus,
  getMyTrips,
  getPendingRides,
  getCurrentAssignedRide // Kan waa kan cusub ee la midka ah myTrip
} = require("../controllers/driverController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

/* ========================================================
   ALL DRIVERS (ADMIN ONLY)
======================================================== */
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getAllDrivers
);

/* ========================================================
   DRIVER PROFILE
======================================================== */
router.get(
  "/me",
  protect,
  authorizeRoles("driver"),
  getMyDriverProfile
);

/* ========================================================
   UPDATE DRIVER STATUS
======================================================== */
router.put(
  "/status",
  protect,
  authorizeRoles("driver"),
  updateDriverStatus
);

/* ========================================================
   DRIVER TRIPS HISTORY
======================================================== */
router.get(
  "/my-trips",
  protect,
  authorizeRoles("driver"),
  getMyTrips
);

/* ========================================================
   PENDING RIDES (KII HORE EE SUGOO_DHAN AHAA)
======================================================== */
router.get(
  "/pending-rides",
  protect,
  authorizeRoles("driver"),
  getPendingRides
);

/* ========================================================
   CURRENT ASSIGNED RIDE (KASOO AQRIYA currentTrip)
======================================================== */
router.get(
  "/current-assignment",
  protect,
  authorizeRoles("driver"),
  getCurrentAssignedRide
);

module.exports = router;
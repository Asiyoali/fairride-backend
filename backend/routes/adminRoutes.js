const express = require("express");
const {
  dashboard,
  getDrivers,
  approveDriver,
  deleteDriver,
  getAllRides,
  getReports,
  resetTodayTrips
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/dashboard", dashboard);
router.get("/drivers", getDrivers);
router.get("/rides", getAllRides);
router.get("/reports", getReports);
router.put("/drivers/approve/:id", approveDriver);
router.delete("/drivers/:id", deleteDriver);
router.put("/reset-trips", resetTodayTrips);

module.exports = router;

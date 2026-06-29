const express = require("express");

const {
  requestRide,
  getMyRides,
  getCurrentRide,
  acceptRide,
  completeRide,
  cancelRide,
  rejectRide
} = require("../controllers/rideController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/request", protect, authorizeRoles("passenger"), requestRide);
router.get("/my-rides", protect, getMyRides);
router.get("/current", protect, authorizeRoles("passenger"), getCurrentRide);
router.put("/accept/:id", protect, authorizeRoles("driver"), acceptRide);
router.put("/complete/:id", protect, authorizeRoles("driver"), completeRide);
router.put("/cancel/:id", protect, cancelRide);
router.put( "/reject/:id",protect,rejectRide);

module.exports = router;
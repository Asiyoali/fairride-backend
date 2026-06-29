const express = require("express");
const {
  createRating,
  getDriverRatings
} = require("../controllers/ratingController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, authorizeRoles("passenger"), createRating);
router.get("/driver/:driverId", protect, getDriverRatings);

module.exports = router;

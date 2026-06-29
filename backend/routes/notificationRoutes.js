const express = require("express");
const { getMyNotifications, markAsRead } = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Dhammaan route-yadan waxay u baahan yihiin in qofku Login yahay
router.use(protect);

router.get("/", getMyNotifications); // GET: /api/notifications
router.put("/:id/read", markAsRead);  // PUT: /api/notifications/:id/read

module.exports = router;
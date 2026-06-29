const Notification = require("../models/Notification");

// Soo qaad dhammaan ogeysiisyada qofka soo galay (Logged-in User)
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id })
      .populate("senderId", "name phone")
      .sort({ createdAt: -1 }); // Kuwa cusub baa soo horreeya

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// U calaamadee ogeysiiska mid la akhriyey (Mark as Read)
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Xaqiiji in qofka akhrinaya uu yahay qofkii loo sheegay ogeysiiska
    if (notification.recipientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: "Notification marked as read", notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead
};
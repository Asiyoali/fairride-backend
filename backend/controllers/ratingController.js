const Rating = require("../models/Rating");
const Ride = require("../models/Ride");

const createRating = async (req, res) => {
  try {
    const { rideId, rating, comment } = req.body;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.passengerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only rate your own ride" });
    }

    if (ride.status !== "completed") {
      return res.status(400).json({ message: "Only completed rides can be rated" });
    }

    const exists = await Rating.findOne({ rideId });

    if (exists) {
      return res.status(400).json({ message: "This ride is already rated" });
    }

    const newRating = await Rating.create({
      passengerId: req.user._id,
      driverId: ride.driverId,
      rideId,
      rating,
      comment
    });

    res.status(201).json({
      message: "Rating submitted successfully",
      rating: newRating
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDriverRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ driverId: req.params.driverId })
      .populate("passengerId", "name")
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRating, getDriverRatings };

import { useEffect, useState } from "react";
import { getMyRides, cancelRide } from "../services/rideService";
import { submitRating } from "../services/ratingService";

function MyTrips() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});

  const loadRides = async () => {
    try {
      const data = await getMyRides();
      setRides(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRides();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "assigned":
        return "status-assigned";
      case "accepted":
        return "status-accepted";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  const handleCancelRide = async (rideId) => {
    try {
      const data = await cancelRide(rideId);
      alert(data.message);
      loadRides();
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to cancel ride"
      );
    }
  };

  const handleRating = async (rideId) => {
    try {
      const data = await submitRating({
        rideId,
        rating: ratings[rideId],
        comment: comments[rideId] || ""
      });

      alert(data.message);
      loadRides();
    } catch (error) {
      alert(error.response?.data?.message || "Rating failed");
    }
  };

  if (loading) {
    return (
      <div className="driver-page-loading">
        <div className="spinner"></div>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="trips-page">
      
      {/* 1. HEADER AREA */}
      <div className="trips-header">
        <div className="hero-content">
          <h1>My Trips</h1>
        </div>
      </div>

      {/* 2. TRIP LIST CONTAINER */}
      <div className="trips-list-container">
        {rides.length === 0 ? (
          <div className="empty-state-box">
            <p className="empty-text">No trips found</p>
          </div>
        ) : (
          rides.map((ride) => (
            <div className="trip-card" key={ride._id}>
              
              {/* Trip Info Header */}
              <div className="trip-card-header">
                <span className="trip-date">
                  {new Date(ride.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span className={`status-badge ${getStatusClass(ride.status)}`}>
                  {ride.status.toUpperCase()}
                </span>
              </div>

              {/* Route Map Visual */}
              <div className="route-info">
                <div className="route-dot pickup"></div>
                <div className="route-path"></div>
                <div className="route-dot destination"></div>
                
                <div className="route-details">
                  <div className="location-block">
                    <span className="label">PICKUP</span>
                    <p className="val">{ride.pickupLocation}</p>
                  </div>
                  <div className="location-block">
                    <span className="label">DESTINATION</span>
                    <p className="val">{ride.destination}</p>
                  </div>
                </div>
              </div>

              {/* Driver Details */}
              {ride.driverId ? (
                <div className="current-driver-info">
                  <div className="info-row">
                    <span className="info-label">Driver</span>
                    <span className="info-value">{ride.driverId.userId?.name || "N/A"}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{ride.driverId.userId?.phone || "N/A"}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Vehicle</span>
                    <span className="info-value">
                      {ride.driverId.carModel || "N/A"} ({ride.driverId.carNumber || "N/A"})
                    </span>
                  </div>
                </div>
              ) : (
                <div className="driver-status-message">
                  <p>
                    {ride.status === "cancelled" 
                      ? "No driver was assigned" 
                      : "Waiting for driver assignment..."}
                  </p>
                </div>
              )}

              {/* Cancel Button Option */}
              {(ride.status === "pending" || ride.status === "assigned") && (
                <div className="trip-actions">
                  <button
                    className="cancel-btn"
                    onClick={() => handleCancelRide(ride._id)}
                  >
                    Cancel Ride
                  </button>
                </div>
              )}

              {/* Rating System Form */}
              {ride.status === "completed" && ride.driverId && (
                <div className="rating-box">
                  <h4>Rate Your Driver</h4>

                  <div className="rating-form-fields">
                    <select
                      value={ratings[ride._id] || ""}
                      onChange={(e) =>
                        setRatings({
                          ...ratings,
                          [ride._id]: Number(e.target.value)
                        })
                      }
                    >
                      <option value="">Select rating</option>
                      <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                      <option value="4">⭐⭐⭐⭐ Good</option>
                      <option value="3">⭐⭐⭐ Average</option>
                      <option value="2">⭐⭐ Poor</option>
                      <option value="1">⭐ Bad</option>
                    </select>

                    <textarea
                      placeholder="Share your experience (optional)..."
                      value={comments[ride._id] || ""}
                      onChange={(e) =>
                        setComments({
                          ...comments,
                          [ride._id]: e.target.value
                        })
                      }
                    />

                    <button
                      className="submit-rating-btn"
                      onClick={() => handleRating(ride._id)}
                      disabled={!ratings[ride._id]}
                    >
                      Submit Rating
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default MyTrips;
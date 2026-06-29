import { useEffect, useState } from "react";
import axios from "axios"; 

import {
  updateDriverStatus,
  getPendingRides,
  acceptRide,
  completeRide
} from "../services/driverService";

import { getMyRides } from "../services/rideService";

function DriverDashboard() {
  const [pendingRides, setPendingRides] = useState([]);
  const [activeRides, setActiveRides] = useState([]);
  const [driverStatus, setDriverStatus] = useState("offline");
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const districtDistances = {
    "Abdiaziz": 13, "Bondhere": 10, "Dayniile": 16, "Dharkenley": 8,
    "Hamar Jajab": 7, "Hamar Weyne": 8, "Hodan": 6, "Howlwadaag": 8,
    "Karaan": 14, "Shangaani": 9, "Shibis": 11, "Waaberi": 4,
    "Wadajir": 7, "Wardhiigley": 9, "Yaaqshiid": 12, "Madiina": 14,
    "Garasbaaley": 18, "Heliwaa": 15
  };

  const [earnings, setEarnings] = useState({ today: 0, weekly: 0, total: 0 });
  const [driverRating, setDriverRating] = useState(4.8); 

  const calculateEarnings = (allRides) => {
    let todaySum = 0;
    let weeklySum = 0;
    let totalSum = 0;

    const now = new Date();
    const todayStr = now.toDateString();
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    allRides.forEach((ride) => {
      if (ride.status === "completed") {
        const fare = ride.fare ? ride.fare : (districtDistances[ride.district] * 0.5 || districtDistances[ride.destination] * 0.5 || 0);
        totalSum += fare;

        const dateRaw = ride.completedAt || ride.updatedAt || ride.createdAt;
        const rideDate = dateRaw ? new Date(dateRaw) : new Date();
        
        if (rideDate.toDateString() === todayStr) {
          todaySum += fare;
        }
        if (rideDate >= oneWeekAgo) {
          weeklySum += fare;
        }
      }
    });

    setEarnings({ today: todaySum, weekly: weeklySum, total: totalSum });
  };

  const checkCurrentAssignment = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/drivers/current-assignment", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const myRidesData = await getMyRides();
      calculateEarnings(myRidesData);

      if (response.data && response.data.ride) {
        setActiveRides([response.data.ride]);
        if (response.data.ride.status === "assigned" || response.data.ride.status === "accepted") {
          setDriverStatus("busy");
        }
      } else {
        const currentActive = myRidesData.filter(
          (ride) => ride.status === "assigned" || ride.status === "accepted"
        );
        setActiveRides(currentActive);
        if (currentActive.length > 0) {
          setDriverStatus("busy");
        } else {
          // Halkan ogeysiisyada waa laga masaxayaa mar kasta haddii active rides ay eber tahay
          setNotifications([]);
        }
      }
    } catch (error) {
      console.log("Error checking current assignment:", error);
    }
  };

  const loadDriverData = async () => {
    try {
      setLoading(true);
      const pendingData = await getPendingRides();
      setPendingRides(pendingData.filter((ride) => ride.status === "pending"));
      await checkCurrentAssignment();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDriverData();

    const interval = setInterval(() => {
      setActiveRides((prevActiveRides) => {
        const previousActiveCount = prevActiveRides.length;

        getPendingRides().then(pendingData => {
          setPendingRides(pendingData.filter((ride) => ride.status === "pending"));
        }).catch(err => console.log(err));

        const token = localStorage.getItem("token");
        axios.get("http://localhost:5000/api/drivers/current-assignment", {
          headers: { Authorization: `Bearer ${token}` }
        }).then(async (response) => {
          let currentActive = [];
          if (response.data && response.data.ride) {
            currentActive = [response.data.ride];
          } else {
            const myRidesData = await getMyRides();
            calculateEarnings(myRidesData);
            currentActive = myRidesData.filter(
              (ride) => ride.status === "assigned" || ride.status === "accepted"
            );
          }

          // Xallinta dhibaatada: Haddii safarku dhammaado, nadiifi ogeysiisyada dhan
          if (currentActive.length === 0) {
            setNotifications([]);
          } else if (currentActive.length > previousActiveCount) {
            const newRide = currentActive[currentActive.length - 1];
            if (newRide && newRide.status === "assigned") {
              const fareAmt = newRide.fare ? newRide.fare : (districtDistances[newRide.district] * 0.5 || districtDistances[newRide.destination] * 0.5 || 0);
              const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

              const newNotif = {
                id: newRide._id,
                title: "New Ride Assigned",
                message: `Waxaa laguu xilsaaray safar cusub oo ku socda ${newRide.district || newRide.destination || "Degmada la doortay"}. Lacagta: $${fareAmt.toFixed(2)}`,
                time: currentTime
              };
              setNotifications(prev => [newNotif, ...prev]);
            }
          }
        }).catch(err => console.log(err));

        return prevActiveRides; 
      });

      getMyRides().then(calculateEarnings).catch(err => console.log(err));

    }, 5000); 

    return () => clearInterval(interval);
  }, []);

  const handleAvailable = async () => {
    try {
      const data = await updateDriverStatus("available");
      alert(data.message);
      setDriverStatus("available");
      loadDriverData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleOffline = async () => {
    try {
      const data = await updateDriverStatus("offline");
      alert(data.message);
      setDriverStatus("offline");
      loadDriverData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleAcceptRide = async (rideId) => {
    try {
      const data = await acceptRide(rideId);
      alert(data.message);
      setDriverStatus("busy");
      setNotifications([]); 
      loadDriverData();
    } catch (error) {
      alert(error.response?.data?.message || "Accept failed");
    }
  };

  const handleCompleteRide = async (rideId) => {
    try {
      const data = await completeRide(rideId);
      alert(data.message);
      setDriverStatus("available");
      setNotifications([]); 
      loadDriverData();
    } catch (error) {
      alert(error.response?.data?.message || "Complete failed");
    }
  };

  const handleRejectRide = async (rideId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/api/rides/reject/${rideId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message);
      setDriverStatus("available");
      setNotifications([]); 
      loadDriverData();
    } catch (error) {
      alert(error.response?.data?.message || "Reject failed");
    }
  };

  return (
    <div className="driver-page">
      
      <div className="driver-hero">
        <div className="hero-content">
          <span className="badge-portal">Driver Portal</span>
          <h1>Driver Dashboard</h1>
          <span style={{ background: "#fef08a", color: "#854d0e", padding: "4px 10px", borderRadius: "20px", fontWeight: "bold", fontSize: "14px", marginTop: "5px", display: "inline-block" }}>
            ⭐ {driverRating} Average Rating
          </span>
        </div>

        <div className="driver-status-area">
          <span className={driverStatus === "available" ? "status-online" : driverStatus === "busy" ? "status-busy-badge" : "status-offline"}>
            {driverStatus === "available" ? "Online" : driverStatus === "busy" ? "Busy" : "Offline"}
          </span>
          
          <div className="status-buttons">
            <button className="driver-status-btn" onClick={handleAvailable}>Go Online</button>
            <button className="driver-offline-btn" onClick={handleOffline}>Go Offline</button>
          </div>
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="driver-section notifications-panel" style={{ backgroundColor: "#fff7ed", border: "1px solid #ffedd5", borderRadius: "8px", padding: "15px", marginBottom: "20px" }}>
          <div className="section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h2 style={{ color: "#c2410c", margin: 0, fontSize: "18px" }}>🔔 Notifications</h2>
            <button 
              onClick={() => setNotifications([])} 
              style={{ background: "none", border: "none", color: "#9a3412", cursor: "pointer", fontSize: "13px", textDecoration: "underline" }}
            >
              Clear All
            </button>
          </div>
          <div className="notifications-list" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {notifications.map((notif) => (
              <div key={notif.id} className="notification-card" style={{ background: "#ffffff", padding: "12px", borderRadius: "6px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", borderLeft: "4px solid #ea580c" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <strong style={{ color: "#ea580c", fontSize: "14px" }}>{notif.title}</strong>
                  <span style={{ color: "#9ca3af", fontSize: "12px" }}>{notif.time}</span>
                </div>
                <p style={{ margin: 0, color: "#4b5563", fontSize: "13px" }}>{notif.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="driver-grid" style={{ marginBottom: "20px" }}>
        <div className="driver-card" style={{ borderLeft: "4px solid #10b981", background: "#f0fdf4" }}>
          <h3 style={{ color: "#065f46" }}>Today's Earnings</h3>
          <p className="card-value" style={{ color: "#10b981" }}>${earnings.today.toFixed(2)}</p>
        </div>

        <div className="driver-card" style={{ borderLeft: "4px solid #3b82f6", background: "#eff6ff" }}>
          <h3 style={{ color: "#1e40af" }}>Weekly Earnings</h3>
          <p className="card-value" style={{ color: "#3b82f6" }}>${earnings.weekly.toFixed(2)}</p>
        </div>

        <div className="driver-card" style={{ borderLeft: "4px solid #8b5cf6", background: "#f5f3ff" }}>
          <h3 style={{ color: "#5b21b6" }}>Total Earnings</h3>
          <p className="card-value" style={{ color: "#8b5cf6" }}>${earnings.total.toFixed(2)}</p>
        </div>
      </div>

      <div className="driver-grid">
        <div className="driver-card driver-blue">
          <h3>Pending Requests</h3>
          <p className="card-value">{pendingRides.length}</p>
        </div>

        <div className="driver-card driver-green">
          <h3>Active Rides</h3>
          <p className="card-value">{activeRides.length}</p>
        </div>

        <div className="driver-card driver-orange">
          <h3>Status</h3>
          <p className="card-value-status">
            {driverStatus === "available" ? "Online" : driverStatus === "busy" ? "Busy" : "Offline"}
          </p>
        </div>
      </div>

      <div className="driver-section">
        <div className="section-title">
          <h2>Active Rides</h2>
        </div>

        {activeRides.length === 0 ? (
          <p className="empty-text">No active rides</p>
        ) : (
          activeRides.map((ride) => (
            <div className={`ride-item-card ${ride.status === "assigned" ? "trip-assigned" : "trip-accepted"}`} key={ride._id}>
              <div className="ride-card-main">
                <div className="route-info">
                  <div className="route-dot pickup"></div>
                  <div className="route-path"></div>
                  <div className="route-dot destination"></div>
                  
                  <div className="route-details">
                    <div className="location-block">
                      <span className="label">PICKUP</span>
                      <p className="val">{ride.pickupLocation || "Airport"}</p>
                    </div>

                    <div className="location-block">
                      <span className="label">TO DISTRICT</span>
                      <p className="val">Airport - {ride.district || ride.destination || "Selected District"}</p>
                    </div>

                    {ride.exactLocation && (
                      <div className="location-block" style={{ marginTop: "10px" }}>
                        <button type="button" className="special-place-btn" style={{ padding: "8px 12px", cursor: "default", backgroundColor: "#eff6ff", border: "1px dashed #bfdbfe", color: "#2563eb", fontWeight: "bold", borderRadius: "6px" }}>
                          SPECIAL PLACE REQUESTED: {ride.exactLocation}
                        </button>
                      </div>
                    )}
                    
                    <div className="location-block">
                      <span className="label">TRIP FARE</span>
                      <p className="val" style={{ color: "#10b981", fontWeight: "bold" }}>
                        ${ride.fare ? ride.fare : (districtDistances[ride.district] * 0.5 || districtDistances[ride.destination] * 0.5 || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="passenger-info-panel">
                  <div className="info-row">
                    <span className="info-label">Passenger</span>
                    <span className="info-value">{ride.passengerId?.name || "Unknown"}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{ride.passengerId?.phone || "N/A"}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Status</span>
                    <span className={`status-badge status-${ride.status}`}>
                      {ride.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="driver-actions-panel">
                {ride.status === "assigned" && (
                  <>
                    <button className="btn-action btn-accept" onClick={() => handleAcceptRide(ride._id)}>Accept Ride</button>
                    <button className="btn-action btn-reject" onClick={() => handleRejectRide(ride._id)}>Reject Ride</button>
                  </>
                )}

                {ride.status === "accepted" && (
                  <button className="btn-action btn-complete" onClick={() => handleCompleteRide(ride._id)}>Complete Ride</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="driver-section">
        <div className="section-title">
          <h2>Pending Requests</h2>
        </div>

        {pendingRides.length === 0 ? (
          <p className="empty-text">No pending requests</p>
        ) : (
          <div className="pool-grid">
            {pendingRides.map((ride) => (
              <div className="pool-item-card" key={ride._id}>
                <div className="pool-route">
                  <p className="pool-pickup"><strong>From:</strong> {ride.pickupLocation}</p>
                  <p className="pool-dest"><strong>To:</strong> {ride.district || ride.destination}</p>
                  <p style={{ margin: "5px 0 0 0", color: "#10b981", fontWeight: "600" }}>
                    Fare: ${ride.fare ? ride.fare : (districtDistances[ride.district] * 0.5 || districtDistances[ride.destination] * 0.5 || 0)}
                  </p>
                </div>
                <div className="pool-passenger">
                  <span>Passenger: {ride.passengerId?.name || "Unknown"}</span>
                </div>
                <div className="pool-badge-wrapper">
                  <span className="pool-status-badge">{ride.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DriverDashboard;
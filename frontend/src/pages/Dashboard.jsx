import { useEffect, useState } from "react";
import axios from "axios"; 
import { requestRide, getMyRides } from "../services/rideService";

function Dashboard() {
  const [pickupLocation, setPickupLocation] = useState("Airport");
  const [district, setDistrict] = useState("");
  const [exactLocation, setExactLocation] = useState("");
  const [rides, setRides] = useState([]);

  // KAN AYAA CUSUB: State-ka maamulaya ogeysiisyada rakaabka (Passenger Notifications)
  const [notifications, setNotifications] = useState([]);

  const districts = [
    "Abdiaziz", "Bondhere", "Dayniile", "Dharkenley", "Hamar Jajab",
    "Hamar Weyne", "Hodan", "Howlwadaag", "Karaan", "Shangaani",
    "Shibis", "Waaberi", "Wadajir", "Wardhiigley", "Yaaqshiid",
    "Madiina", "Garasbaaley", "Heliwaa"
  ];

  const districtDistances = {
    "Abdiaziz": 13, "Bondhere": 10, "Dayniile": 16, "Dharkenley": 8,
    "Hamar Jajab": 7, "Hamar Weyne": 8, "Hodan": 6, "Howlwadaag": 8,
    "Karaan": 14, "Shangaani": 9, "Shibis": 11, "Waaberi": 4,
    "Wadajir": 7, "Wardhiigley": 9, "Yaaqshiid": 12, "Madiina": 14,
    "Garasbaaley": 18, "Heliwaa": 15
  };

  const loadRides = async () => {
    try {
      const data = await getMyRides();
      setRides(data);
    } catch (error) {
      console.log("Error loading rides:", error);
    }
  };

  // KAN AYAA CUSUB: Interval u shaqaynaya sidii darawalka si uu 5-tii ilbiriqsiba u eego haddii darawal aqbalay safarka
  useEffect(() => {
    loadRides();

    const interval = setInterval(() => {
      getMyRides().then(data => {
        // Angoo isticmaalaya rides-kii hore iyo kuwa cusub si aan u aragno isbedelka status-ka
        setRides(prevRides => {
          data.forEach(newRide => {
            const oldRide = prevRides.find(r => r._id === newRide._id);
            
            // XEERKA CUSUB: Haddii safarku hore u ahaa pending/assigned laakiin hadda uu noqday "accepted"
            if (oldRide && oldRide.status !== "accepted" && newRide.status === "accepted") {
              const driverName = newRide.driverId?.userId?.name || newRide.driverId?.name || "Darawalka";
              const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              
              const newNotif = {
                id: newRide._id,
                title: "Driver Accepted Your Ride",
                message: `${driverName} wuxuu aqbalay safarkaagii, wuxuu ku soo jiraa jidka!`,
                time: currentTime
              };
              
              setNotifications(prevNotifs => [newNotif, ...prevNotifs]);
            }

            // XEERKA CUSUB: Haddii safarku dhammaado (completed) ama la tirtiro, nadiifi ogeysiiska la xiriira safarkaas
            if (oldRide && newRide.status === "completed") {
              setNotifications([]); // Dashboard-ka rakaabka waa uu nadiifmayaa marka uu safarku dhammaado
            }
          });
          return data;
        });
      }).catch(err => console.log("Interval fetch error:", err));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentRide = rides.find(
    (ride) =>
      ride.status === "pending" ||
      ride.status === "assigned" ||
      ride.status === "accepted"
  );

  const getStatusClass = (status) => {
    switch (status) {
      case "pending": return "status-pending";
      case "assigned": return "status-assigned";
      case "accepted": return "status-accepted";
      case "completed": return "status-completed";
      case "cancelled": return "status-cancelled";
      default: return "";
    }
  };

  const handleRequestRide = async (e) => {
    e.preventDefault();
    try {
      const selectedDistrict = district; 
      const data = await requestRide({
        pickupLocation: pickupLocation, 
        district: selectedDistrict,
        destination: selectedDistrict, 
        exactLocation: exactLocation.trim()
      });
      alert(data.message || "Ride requested successfully!");
      setDistrict("");
      setExactLocation("");
      loadRides();
    } catch (error) {
      alert(error.response?.data?.message || "Ride request failed");
    }
  };

  return (
    <div className="dashboard-page">
      
      <div className="dashboard-hero">
        <div className="hero-content">
          <span>Passenger Panel</span>
          <h1>Welcome to FairRide</h1>
        </div>
        <button onClick={() => document.getElementById("request-ride-section")?.scrollIntoView({ behavior: 'smooth' })}>
          Request Taxi
        </button>
      </div>

      {/* KAN AYAA CUSUB: QAYBTA OGEYSIISYADA RAKAABKA (PASSENGER NOTIFICATIONS PANEL) */}
      {notifications.length > 0 && (
        <div className="passenger-section notifications-panel" style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "15px", marginBottom: "20px", width: "100%", boxSizing: "border-box" }}>
          <div className="section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h2 style={{ color: "#166534", margin: 0, fontSize: "18px" }}>🔔 Notifications</h2>
            <button 
              onClick={() => setNotifications([])} 
              style={{ background: "none", border: "none", color: "#166534", cursor: "pointer", fontSize: "13px", textDecoration: "underline" }}
            >
              Nadiifi Dhamaan
            </button>
          </div>
          <div className="notifications-list" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {notifications.map((notif) => (
              <div key={notif.id} className="notification-card" style={{ background: "#ffffff", padding: "12px", borderRadius: "6px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", borderLeft: "4px solid #22c55e" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <strong style={{ color: "#16a34a", fontSize: "14px" }}>{notif.title}</strong>
                  <span style={{ color: "#9ca3af", fontSize: "12px" }}>{notif.time}</span>
                </div>
                <p style={{ margin: 0, color: "#4b5563", fontSize: "13px" }}>{notif.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card blue-card">
          <h3>Total Rides</h3>
          <p className="card-value">{rides.length}</p>
        </div>
        <div className="stat-card green-card">
          <h3>Active Trips</h3>
          <p className="card-value">{currentRide ? "1 Active" : "0 Active"}</p>
        </div>
        <div className="stat-card orange-card">
          <h3>Account Level</h3>
          <p className="card-value">Gold Member</p>
        </div>
      </div>

      {currentRide && (
        <div className="current-ride-card">
          <div className="section-title">
            <h2>Current Ride</h2>
          </div>

          <div className="ride-card-main">
            <div className="route-info">
              <div className="route-dot pickup"></div>
              <div className="route-path"></div>
              <div className="route-dot destination"></div>
              
              <div className="route-details">
                <div className="location-block">
                  <span className="label">PICKUP</span>
                  <p className="val">{currentRide.pickupLocation || "Airport"}</p>
                </div>

                <div className="location-block">
                  <span className="label">TO DISTRICT</span>
                  <p className="val">
                    Airport - {currentRide.district || currentRide.destination || "Selected District"}
                  </p>
                </div>

                {currentRide.exactLocation && (
                  <div className="location-block" style={{ marginTop: "10px" }}>
                    <button 
                      type="button" 
                      className="special-place-btn" 
                      style={{ padding: "8px 12px", cursor: "default" }}
                    >
                      SPECIAL PLACE REQUESTED: {currentRide.exactLocation}
                    </button>
                  </div>
                )}
                
                <div className="location-block">
                  <span className="label">TRIP FARE</span>
                  <p className="val">
                    ${currentRide.fare ? Number(currentRide.fare).toFixed(2) : ((districtDistances[currentRide.district] || districtDistances[currentRide.destination] || 10) * 0.5).toFixed(2)}
                  </p>
                </div>
                
              </div>
            </div>

            <div className="passenger-info-panel">
              <div className="info-row">
                <span className="info-label">Status</span>
                <span className={`status-badge ${getStatusClass(currentRide.status)}`}>
                  {currentRide.status.toUpperCase()}
                </span>
              </div>

              {currentRide.driverId ? (
                <div className="current-driver-info">
                  <div className="info-row">
                    <span className="info-label">Driver</span>
                    <span className="info-value">{currentRide.driverId.userId?.name || currentRide.driverId.name || "Assigned"}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{currentRide.driverId.userId?.phone || "N/A"}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Car Model</span>
                    <span className="info-value">{currentRide.driverId.carModel || "N/A"}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Car Number</span>
                    <span className="info-value">{currentRide.driverId.carNumber || "N/A"}</span>
                  </div>
                </div>
              ) : (
                <div className="waiting-driver-msg">
                  <span>Waiting for available driver...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-section" id="request-ride-section">
        <div className="section-title">
          <h2>Request Airport Taxi</h2>
        </div>

        <form className="ride-form" onSubmit={handleRequestRide}>
          <input
            type="text"
            value={pickupLocation}
            readOnly
            style={{ backgroundColor: "#e2e8f0", cursor: "not-allowed", color: "#475569", fontWeight: "bold" }}
          />

          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            required
          >
            <option value="">Select District</option>
            {districts.map((districtName) => (
              <option key={districtName} value={districtName}>
                {districtName}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Exact Location (Optional)"
            value={exactLocation}
            onChange={(e) => setExactLocation(e.target.value)}
          />

          {district && districtDistances[district] && (
            <div style={{ padding: "10px 0", fontSize: "14px", fontWeight: "bold" }}>
              Estimated Price: ${(districtDistances[district] * 0.5).toFixed(2)}
            </div>
          )}

          <button type="submit">Request Ride</button>
        </form>
      </div>

      <div className="dashboard-section">
        <div className="section-title">
          <h2>My Ride Requests</h2>
        </div>

        {rides.length === 0 ? (
          <p className="empty-text">No ride requests yet</p>
        ) : (
          <div className="rides-list">
            {rides.map((ride) => (
              <div className="ride-item" key={ride._id}>
                <div className="ride-details-row">
                  <h3>Airport - {ride.district || ride.destination || "N/A"}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontWeight: "bold" }}>
                      ${ride.fare ? Number(ride.fare).toFixed(2) : ((districtDistances[ride.district] || districtDistances[ride.destination] || 10) * 0.5).toFixed(2)}
                    </span>
                    <span className={`status-badge ${getStatusClass(ride.status)}`}>
                      {ride.status}
                    </span>
                  </div>
                </div>
                <p className="ride-meta">
                  District: {ride.district || ride.destination || "N/A"}
                  {ride.exactLocation ? ` | Special Place: ${ride.exactLocation}` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default Dashboard;
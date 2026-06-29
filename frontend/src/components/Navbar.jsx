import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Sate-ka maamulaya ogeysiisyada iyo dropdown-ka
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // 1. Soo qaad ogeysiisyada haddii qofku login yahay
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const response = await fetch("http://localhost:5000/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Ku xir interval si uu 5-tii ilbiriqsiba mar u eego ogeysiis cusub (Polling)
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [token]);

  // 2. U calaamadee ogeysiiska mid la akhriyey (Mark as Read)
  const handleMarkAsRead = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        // Ku cusboonaysii state-ka si toos ah
        setNotifications((prev) =>
          prev.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif))
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
  };

  // Tiri inta ogeysiis oo aan la akhrin wali
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <nav className="navbar" style={{ position: "relative" }}>
      <h2>FairRide</h2>

      <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <Link to="/">Home</Link>

        {/* SHOW ONLY WHEN NOT LOGGED IN */}
        {!token && (
          <>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}

        {/* PASSENGER ONLY LINKS */}
        {token && user?.role === "passenger" && (
          <>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/my-trips">My Trips</Link>
            <Link to="/profile">Profile</Link>
          </>
        )}

        {/* DRIVER ONLY LINKS */}
        {token && user?.role === "driver" && (
          <>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/driver-dashboard">Driver</Link>
            <Link to="/profile">Profile</Link>
          </>
        )}

        {/* ADMIN ONLY LINKS */}
        {token && user?.role === "admin" && (
          <>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/driver-dashboard">Driver</Link>
            <Link to="/admin-dashboard">Admin</Link>
            <Link to="/my-trips">My Trips</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/reports">Reports</Link>
          </>
        )}

        {/* ==================== GAMBALEELKA OGEYSIISYADA (🔔) ==================== */}
        {token && (
          <div className="notification-container" style={{ position: "relative", cursor: "pointer" }}>
            <span 
              onClick={() => setShowDropdown(!showDropdown)} 
              style={{ fontSize: "20px", position: "relative" }}
            >
              🔔
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  background: "red",
                  color: "white",
                  borderRadius: "50%",
                  padding: "2px 6px",
                  fontSize: "10px",
                  fontWeight: "bold"
                }}>
                  {unreadCount}
                </span>
              )}
            </span>

            {/* DROPDOWN MENU-GA OGEYSIISYADA */}
            {showDropdown && (
              <div className="notif-dropdown" style={{
                position: "absolute",
                top: "30px",
                right: "0",
                background: "white",
                color: "black",
                boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
                borderRadius: "6px",
                width: "280px",
                maxHeight: "350px",
                overflowY: "auto",
                zIndex: 100,
                padding: "10px"
              }}>
                <h4 style={{ margin: "0 0 10px 0", borderBottom: "1px solid #eee", pb: "5px" }}>Notifications</h4>
                {notifications.length === 0 ? (
                  <p style={{ fontSize: "13px", color: "gray", margin: "5px 0" }}>No notifications yet</p>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif._id} 
                      onClick={() => handleMarkAsRead(notif._id)}
                      style={{
                        padding: "8px",
                        borderBottom: "1px solid #f5f5f5",
                        background: notif.isRead ? "transparent" : "#f0f7ff",
                        fontSize: "12px",
                        borderRadius: "4px",
                        marginBottom: "4px",
                        transition: "background 0.3s"
                      }}
                    >
                      <strong style={{ display: "block", color: "#333" }}>{notif.title}</strong>
                      <span style={{ color: "#555" }}>{notif.message}</span>
                      <small style={{ display: "block", color: "gray", marginTop: "3px", fontSize: "10px" }}>
                        {new Date(notif.createdAt).toLocaleTimeString()}
                      </small>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
        {/* ======================================================================= */}

        {token && (
          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}

      </div>
    </nav>
  );
}

export default Navbar;
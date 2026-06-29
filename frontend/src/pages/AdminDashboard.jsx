import { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function AdminDashboard() {
  const [drivers, setDrivers] = useState([]);
  const [revenue, setRevenue] = useState({ today: 0, weekly: 0, monthly: 0, total: 0 });
  // KAN AYAA LA BEDDELAY: Default state ammaan ah baa la siiyay
  const [topDriver, setTopDriver] = useState({ name: "No Driver This Week", trips: 0, earnings: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/dashboard",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setRevenue({
        today: res.data.todayRevenue || 0,
        weekly: res.data.weeklyRevenue || 0,
        monthly: res.data.monthlyRevenue || 0,
        total: res.data.totalRevenue || 0
      });

      // KAN AYAA LA BEDDELAY: Haddii xogta backend la waayo, qoraalka loading-ka waa laga saarayaa
      if (res.data.topDriver && res.data.topDriver.name !== "No Driver Found") {
        setTopDriver(res.data.topDriver);
      } else {
        setTopDriver({ name: "No Driver This Week", trips: 0, earnings: 0 });
      }
    } catch (error) {
      console.log("Error fetching dashboard data:", error);
      setTopDriver({ name: "No Driver This Week", trips: 0, earnings: 0 });
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/drivers",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDrivers(res.data);
    } catch (error) {
      console.log(error);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchDrivers();
  }, []);

  const approveDriver = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/drivers/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Driver Approved Successfully");
      fetchDrivers();
      fetchDashboardData();
    } catch (error) {
      console.log(error);
      alert("Approval Failed");
    }
  };

  const deleteDriver = async (id) => {
    if (!window.confirm("Delete this driver?")) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/admin/drivers/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Driver Deleted Successfully");
      fetchDrivers();
      fetchDashboardData();
    } catch (error) {
      console.log(error);
      alert("Delete Failed");
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const dateStr = new Date().toLocaleString();

      doc.setFontSize(18);
      doc.text("FairRide Administration Report", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${dateStr}`, 14, 28);
      doc.text("------------------------------------------------------------------------------------------", 14, 33);

      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("1. Financial Revenue Summary", 14, 42);

      autoTable(doc, {
        startY: 46,
        head: [["Metric", "Value"]],
        body: [
          ["Today's Revenue", `$${revenue.today.toFixed(2)}`],
          ["Weekly Revenue", `$${revenue.weekly.toFixed(2)}`],
          ["Monthly Revenue", `$${revenue.monthly.toFixed(2)}`],
          ["Total Revenue", `$${revenue.total.toFixed(2)}`],
          ["Top Driver This Week", `${topDriver.name} (${topDriver.trips} Trips)`]
        ],
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246] },
      });

      const finalY = doc.previousAutoTable ? doc.previousAutoTable.finalY + 15 : 100;
      doc.setFontSize(14);
      doc.text("2. Registered Drivers List", 14, finalY);

      const driverRows = filteredDrivers.map((d, index) => [
        index + 1,
        d.userId?.name || "Unknown",
        d.userId?.phone || "N/A",
        d.carModel || "N/A",
        d.carNumber || "N/A",
        d.isApproved ? "Approved" : "Pending",
        d.status || "offline"
      ]);

      autoTable(doc, {
        startY: finalY + 5,
        head: [["#", "Name", "Phone", "Car Model", "Plate #", "Approval", "Status"]],
        body: driverRows,
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129] },
      });

      doc.save(`FairRide_Admin_Report_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error("PDF Generation Error:", err);
      alert("PDF Error: " + err.message);
    }
  };

  const filteredDrivers = drivers.filter((driver) => {
    const name = driver.userId?.name?.toLowerCase() || "";
    const phone = driver.userId?.phone || "";
    const search = searchTerm.toLowerCase();
    return name.includes(search) || phone.includes(search);
  });

  return (
    <div className="admin-page">
      <div className="admin-header">
        <span>Admin Panel</span>
        <h1>FairRide Administration</h1>
        <p>Manage drivers and monitor system activities.</p>
      </div>

      {/* ==================== REVENUE & TOP DRIVER SECTION ==================== */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
        <h2 style={{ fontSize: "1.3rem", color: "#1e293b", margin: 0, fontWeight: "600" }}>
          Admin Revenue & Highlights
        </h2>
        
        <button onClick={exportToPDF} style={{ padding: "10px 18px", background: "#2563eb", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          📥 Download Report (PDF)
        </button>
      </div>

      <div className="admin-stats" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginTop: "15px", marginBottom: "30px" }}>
        <div className="admin-stat-card" style={{ borderLeft: "4px solid #10b981", background: "#f0fdf4" }}>
          <h3 style={{ color: "#065f46" }}>Today's Revenue</h3>
          <p style={{ color: "#10b981", fontSize: "1.6rem", fontWeight: "bold" }}>${revenue.today.toFixed(2)}</p>
        </div>

        <div className="admin-stat-card" style={{ borderLeft: "4px solid #3b82f6", background: "#eff6ff" }}>
          <h3 style={{ color: "#1e40af" }}>Weekly Revenue</h3>
          <p style={{ color: "#3b82f6", fontSize: "1.6rem", fontWeight: "bold" }}>${revenue.weekly.toFixed(2)}</p>
        </div>

        <div className="admin-stat-card" style={{ borderLeft: "4px solid #eab308", background: "#fefce8" }}>
          <h3 style={{ color: "#854d0e" }}>Monthly Revenue</h3>
          <p style={{ color: "#eab308", fontSize: "1.6rem", fontWeight: "bold" }}>${revenue.monthly.toFixed(2)}</p>
        </div>

        <div className="admin-stat-card" style={{ borderLeft: "4px solid #8b5cf6", background: "#f5f3ff" }}>
          <h3 style={{ color: "#5b21b6" }}>Total Revenue</h3>
          <p style={{ color: "#8b5cf6", fontSize: "1.6rem", fontWeight: "bold" }}>${revenue.total.toFixed(2)}</p>
        </div>

        {/* KAN AYAA CUSUB: Top Driver Card */}
        <div className="admin-stat-card" style={{ borderLeft: "4px solid #ec4899", background: "#fdf2f8", minWidth: "220px" }}>
          <h3 style={{ color: "#9d174d", fontWeight: "bold" }}>👑 Top Driver This Week</h3>
          <p style={{ color: "#1e293b", fontSize: "1.1rem", fontWeight: "600", margin: "5px 0" }}>
            {topDriver.name}
          </p>
          <div style={{ fontSize: "13px", color: "#65a30d", fontWeight: "600" }}>
            Trips: <span style={{ color: "#475569" }}>{topDriver.trips}</span> | Earnings: <span>${topDriver.earnings.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* ==================== SYSTEM OVERVIEW STATS ==================== */}
      <h2 style={{ fontSize: "1.3rem", color: "#1e293b", margin: "10px 0", fontWeight: "600" }}>
        System Overview
      </h2>
      <div className="admin-stats" style={{ marginBottom: "25px" }}>
        <div className="admin-stat-card">
          <h3>Total Drivers</h3>
          <p>{drivers.length}</p>
        </div>
        <div className="admin-stat-card">
          <h3>Approved</h3>
          <p>{drivers.filter((d) => d.isApproved).length}</p>
        </div>
        <div className="admin-stat-card">
          <h3>Pending</h3>
          <p>{drivers.filter((d) => !d.isApproved).length}</p>
        </div>
        <div className="admin-stat-card">
          <h3>System Status</h3>
          <p>Active</p>
        </div>
      </div>

      {/* ==================== DRIVER MANAGEMENT TABLE WITH SEARCH ==================== */}
      <div className="admin-table">
        <div className="admin-table-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
          <div>
            <h2>Driver Management</h2>
            <p>Approve or remove drivers.</p>
          </div>
          
          <div style={{ marginLeft: "auto" }}>
            <input
              type="text"
              placeholder="🔍 Search by Name or Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: "10px 15px", width: "280px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
            />
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : filteredDrivers.length === 0 ? (
          <p style={{ padding: "20px", color: "#64748b", textAlign: "center" }}>
            {searchTerm ? "No drivers match your search." : "No Drivers Found"}
          </p>
        ) : (
          filteredDrivers.map((driver) => (
            <div className="admin-row" key={driver._id}>
              <div>
                <h3>
                  {driver.userId?.name || "Unknown Driver"}
                  {driver.isApproved ? (
                    <span className="approved-badge">Approved</span>
                  ) : (
                    <span className="pending-badge">Pending</span>
                  )}
                </h3>
                <p>Email: {driver.userId?.email}</p>
                <p>Phone: {driver.userId?.phone}</p>
                <p>Car: {driver.carModel}</p>
                <p>Plate: {driver.carNumber}</p>
                <p>Status: {driver.status}</p>
              </div>

              <div className="admin-actions">
                {!driver.isApproved && (
                  <button onClick={() => approveDriver(driver._id)}>Approved</button>
                )}
                <button className="delete-btn" onClick={() => deleteDriver(driver._id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
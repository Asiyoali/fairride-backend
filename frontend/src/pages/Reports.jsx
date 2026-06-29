import { useEffect, useState } from "react";
import {
  getAdminDashboard,
  getDriverReports
} from "../services/adminService";

function Reports() {
  const [stats, setStats] = useState({});
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const dashboard = await getAdminDashboard();
        const reports = await getDriverReports();

        setStats(dashboard);
        setDrivers(reports.driverReport || []);
      } catch (error) {
        console.log(error);
      }
    };

    loadReports();
  }, []);

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1>System Reports</h1>
        <p>Airport Taxi System Statistics and Driver Ratings</p>
      </div>

      <div className="reports-grid">
        <div className="report-card">
          <h3>Total Users</h3>
          <p>{stats.totalUsers || 0}</p>
        </div>

        <div className="report-card">
          <h3>Total Drivers</h3>
          <p>{stats.totalDrivers || 0}</p>
        </div>

        <div className="report-card">
          <h3>Total Rides</h3>
          <p>{stats.totalRides || 0}</p>
        </div>

        <div className="report-card">
          <h3>Completed Rides</h3>
          <p>{stats.completedRides || 0}</p>
        </div>
      </div>

      <div className="report-table">
        <h2>Driver Reports</h2>

        {drivers.length === 0 ? (
          <p>No driver reports found.</p>
        ) : (
          drivers.map((driver) => (
            <div className="report-row" key={driver.driverId}>
              <h3>{driver.name}</h3>

              <p>Status: {driver.status}</p>

              <p>Total Trips Today: {driver.totalTripsToday}</p>

              <p>All Time Trips: {driver.allTimeTrips}</p>

              <p>Completed Trips: {driver.completedTrips}</p>

              <p>Cancelled Trips: {driver.cancelledTrips}</p>

              <div className="rating-report">
                <h4>Driver Rating</h4>

                <p>
                  Average Rating:{" "}
                  <strong>
                    {driver.averageRating || 0} ⭐
                  </strong>
                </p>

                <p>
                  Total Ratings:{" "}
                  <strong>{driver.totalRatings || 0}</strong>
                </p>

                {driver.latestComments?.length > 0 ? (
                  <div className="comments-list">
                    <h4>Latest Comments</h4>

                    {driver.latestComments.map((item, index) => (
                      <div className="comment-item" key={index}>
                        <p>
                          <strong>{item.passenger}</strong> rated{" "}
                          {item.rating} ⭐
                        </p>

                        <p>{item.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No comments yet.</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Reports;
import axios from "axios";

const API = "http://localhost:5000/api/admin";

const getToken = () => localStorage.getItem("token");

/* Get Admin Dashboard Stats */
export const getAdminDashboard = async () => {
  const response = await axios.get(`${API}/dashboard`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  return response.data;
};

/* Get Driver Reports */
export const getDriverReports = async () => {
  const response = await axios.get(`${API}/reports`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  return response.data;
};

/* Approve Driver */
export const approveDriver = async (driverId) => {
  const response = await axios.put(
    `${API}/drivers/approve/${driverId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }
  );

  return response.data;
};

/* Delete Driver */
export const deleteDriver = async (driverId) => {
  const response = await axios.delete(`${API}/drivers/${driverId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  return response.data;
};
import axios from "axios";

const API = "http://localhost:5000/api/drivers";
const RIDE_API = "http://localhost:5000/api/rides";

/* Update Driver Status */
export const updateDriverStatus = async (status) => {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `${API}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};

/* Get Pending Rides */
export const getPendingRides = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `${API}/pending-rides`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};

/* Accept Ride */
export const acceptRide = async (rideId) => {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `${RIDE_API}/accept/${rideId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};

/* Complete Ride */
export const completeRide = async (rideId) => {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `${RIDE_API}/complete/${rideId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};

/* Reject Ride (La Nidaamiyay URL-ka) */
export const rejectRide = async (rideId) => {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `${RIDE_API}/reject/${rideId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};
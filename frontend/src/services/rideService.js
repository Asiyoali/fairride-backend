import axios from "axios";

const API = "http://localhost:5000/api/rides";

/* Request Ride */
export const requestRide = async (rideData) => {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    `${API}/request`,
    rideData,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};

/* Get My Rides */
export const getMyRides = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `${API}/my-rides`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};

/* Cancel Ride */
export const cancelRide = async (rideId) => {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `${API}/cancel/${rideId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};
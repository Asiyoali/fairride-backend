import axios from "axios";

const API = "http://localhost:5000/api/auth";

export const loginUser = async (userData) => {
  const response = await axios.post(`${API}/login`, userData);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await axios.post(`${API}/register`, userData);
  return response.data;
};
export const getProfile = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `${API}/profile`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};
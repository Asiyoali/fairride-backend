import axios from "axios";

const API = "http://localhost:5000/api/ratings";

const getToken = () => localStorage.getItem("token");

/* Submit Driver Rating */
export const submitRating = async (ratingData) => {
  const response = await axios.post(
    API,
    ratingData,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }
  );

  return response.data;
};
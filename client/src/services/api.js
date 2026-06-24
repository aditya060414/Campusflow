import axios from "axios";

// Create a pre-configured Axios instance pointing to the Node.js/Express backend API
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

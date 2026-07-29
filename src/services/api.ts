import axios from "axios";

const backendUrl = (
  import.meta.env.VITE_BACK_URL || "http://localhost:3000"
).replace(/\/$/, "");

export const api = axios.create({
  baseURL: `${backendUrl}/api`,
});

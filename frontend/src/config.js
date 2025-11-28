// API Configuration
// Hardcode these values as needed
const hosted = false;

const API_BASE_URL = hosted
  ? "http://139.59.70.203" // Change this to your production API URL
  : "http://localhost:5000";

export { hosted, API_BASE_URL };

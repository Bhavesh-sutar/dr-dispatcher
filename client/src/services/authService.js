import api from "./api"; // Import the Axios instance configured for API requests

// Define the signup function that sends a POST request to the /auth/signup endpoint with user data
const signup = async (userData) => {
  const response = await api.post("/auth/signup", userData);
  return response.data;
};

// Define the login function that sends a POST request to the /auth/login endpoint with user credentials
const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// Create an authService object that contains the signup and login functions for export
const authService = {
  signup,
  login,
  getCurrentUser,
};

// Export the authService object for use in other parts of the application
export default authService;

//App.js file is the main entry point for the server-side application.
// It sets up the Express server, configures middleware, and
// defines routes for handling incoming requests.

const express = require("express"); // Import the Express framework for building web applications
const cors = require("cors"); // Import the CORS middleware to handle Cross-Origin Resource Sharing
const helmet = require("helmet"); // Import the Helmet middleware to enhance security by setting various HTTP headers
const authRoutes = require("./routes/authRoutes"); // Import the authentication routes defined in the authRoutes.js file
const drRoutes = require("./routes/drRoutes"); // Import the DR routes defined in the drRoutes.js file
const errorHandler = require("./middleware/errorHandler");

const app = express(); // Create an instance of the Express application

app.use(helmet()); // Use Helmet middleware to enhance security by setting various HTTP headers
// Use CORS middleware to allow requests from the specified origin and enable credentials
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
); // Use CORS middleware to allow requests from the specified origin and enable credentials

app.use(express.json()); // Use built-in middleware to parse incoming JSON requests

app.use("/api/auth", authRoutes); // Mount the authentication routes at the /api/auth path
app.use("/api/dr", drRoutes); // Mount the DR routes at the /api/dr path
app.use(errorHandler);

// app.get("/api/health", (req, res) => {
//   res.json({
//     success: true,
//     message: "DR Dispatcher API is running",
//   });
// });
// Define a route for the health check endpoint
// that responds with a JSON message indicating the API is running

// app.get("/api/test/403", (req, res) => {
//   res.status(403).json({
//     success: false,
//     message: "Test permission denied",
//   });
// });

module.exports = app; // Export the Express application instance for use in
// other parts of the application, such as the server entry point

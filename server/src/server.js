require("dotenv").config(); // Load environment variables from a .env file into process.env

const app = require("./app"); // Import the Express application instance from the app.js file
const connectDB = require("./config/db"); // Import the database connection function from the db.js file in the config directory

const PORT = process.env.PORT || 5000; // Define the port on which the server will listen for incoming requests,

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    }); // Start the Express server and listen for incoming requests on the specified port
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer(); // Call the startServer function to initiate the server startup process, 
// including database connection and server listening
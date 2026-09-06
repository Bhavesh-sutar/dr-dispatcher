const express = require("express"); // Import the Express framework for building web applications
const { signup, login } = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// Create a new router instance to define routes related to authentication
const router = express.Router(); 

// Define a POST route for user signup and login that maps to their respective controller functions
router.post("/signup", signup);
router.post("/login", login);

//Test route to get the authenticated user's information using the authMiddleware
router.get("/me", authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

// Export the router instance for use in other parts of the application,
module.exports = router;

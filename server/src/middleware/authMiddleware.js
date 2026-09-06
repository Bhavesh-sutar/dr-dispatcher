const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware function to authenticate requests using JSON Web Tokens (JWTs)
const authMiddleware = async (req, res, next) => {
  try {
    // Extract the Authorization header from the incoming request
    const authHeader = req.headers.authorization; 

    // Check if the Authorization header is present and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Extract the token from the Authorization header by splitting the string
    const token = authHeader.split(" ")[1];

    // Verify the token using the secret key defined in the environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user in the database using the decoded user ID from the token
    const user = await User.findById(decoded.userId).select("-password");

    // If no user is found, return a 401 Unauthorized response
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    // Attach the authenticated user object to the request object 
    // for use in subsequent middleware or route handlers
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// Export the authMiddleware function for use in other parts of the application
module.exports = authMiddleware;

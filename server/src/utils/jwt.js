const jwt = require("jsonwebtoken"); // Import the jsonwebtoken library for 
// creating and verifying JSON Web Tokens (JWTs)

// Define a function to generate a JWT for a given user ID

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

// Export the generateToken function for use in other parts of the application
module.exports = {
  generateToken,
};
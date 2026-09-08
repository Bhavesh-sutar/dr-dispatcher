const bcrypt = require("bcryptjs"); // Import the bcryptjs library for hashing passwords
const User = require("../models/User"); // Import the User model from the models directory to 
// interact with the users collection in MongoDB
const { generateToken } = require("../utils/jwt"); // Import the generateToken function 
// from the utils directory to create JSON Web Tokens (JWTs) for authentication


const signup = async ({ name, email, password }) => {
  // Normalize the email by converting it to lowercase and trimming whitespace
  const normalizedEmail = email.toLowerCase().trim(); 

  // Check if a user with the same email already exists in the database
  const existingUser = await User.findOne({ email: normalizedEmail });

  // If a user with the same email exists, throw an error indicating that the user already exists
  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 409;
    throw error;
  }

  // Hash the password using bcrypt with a salt round of 12 for security
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create a new user in the database with the provided name, normalized email, and hashed password
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
  });

  
  const token = generateToken(user._id);

  // Return an object containing the user's ID, name, and email (excluding the password) 
  // to be used in the response
  return {
        token,
        user: {   
            id: user._id,
            name: user.name,
            email: user.email
        }
  };
};

// Define the login function to authenticate a user based on email and password
const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim(); // Normalize the email by converting it to lowercase and trimming whitespace

  const user = await User.findOne({ email: normalizedEmail }); // Find a user in the database with the provided normalized email

  // If no user is found, throw an error indicating that the email or password is invalid

  if (!user) {
    // If no user is found, throw an error indicating that the email or password is invalid.
    // The Error message is intenstionally vague to avoid revealing 
    // whether the email exists in the database
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // Compare the provided password with the hashed password stored in the database using bcrypt
  const isPasswordValid = await bcrypt.compare(password, user.password);

  // If the password is invalid, throw an error indicating that the email or password is invalid
  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // Generate a JSON Web Token (JWT) for the newly created user using their unique ID
  const token = generateToken(user._id);

  // Return an object containing the user's ID, name, and email 
  // (excluding the password)
  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    }
  };
};

// Export the signup and login functions for use in other parts of the application,
module.exports = {
  signup,
  login,
};

// Import the authService module to handle authentication-related operations
const authService = require("../services/authService"); 

// Define the signup controller function to handle user registration requests
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate that all required fields (name, email, password) are provided in the request body
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Name validation: Check if the name is a string and has a length between 2 and 50 characters
    // Email validation: Use a regular expression to validate the email format
    // Password validation: Check if the password is a string and has a minimum length of 8 characters
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^.{8,}$/;

    // Perform validation checks for name, email, and password using the defined regular expressions
    //Name Validation
    if (typeof name !== "string" || !nameRegex.test(name.trim())) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 50 characters and contain only letters and spaces",
      });
    }

    //Email Validation
    if (typeof email !== "string" || !emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    //Password Validation
    if (typeof password !== "string" || !passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Call the signup function from the authService to create a new user in the database
    const user = await authService.signup({
      name,
      email,
      password,
    });

    // Respond with a success message and the newly created user's information 
    // (excluding the password)
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user,
    });
  } catch (error) {
    next(error); // Pass any errors to the next middleware for centralized error handling
  }
};


// Define the login controller function to handle user login requests
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body; // Extract the email and password from the request body

    // Validate that both email and password are provided in the request body
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }


    // Call the login function from the authService to authenticate the user and 
    // retrieve their information
    const loginResult = await authService.login({
      email,
      password,
    });

    // Respond with a success message and the authenticated user's information
    res.status(200).json({
      success: true,
      message: "Login successful",
      ...loginResult,
    });
  } catch (error) {
    next(error);
  }
};

// Export the signup and login controller functions for use in other parts of the application
module.exports = {
  signup,
  login,
};

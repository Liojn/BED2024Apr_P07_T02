// Imports
const User = require("../models/user");
// const bcrypt = require('bcrypt');
 
// Controller function to get all users
const getAllUser = async (req, res) => {
    try {
        const user = await User.getAllUser();
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving users");
    }
};

// Controller function to check users based on email
const checkUser = async (req, res) => {
    const { Email } = req.query;

    if (!Email) {
        return res.status(400).send("Email is required");
    }
    
    try {
        const user = await User.checkUser(Email);

        if (user) {
            // Sending user details if user exists
            return res.status(200).json({
                message: 'User exists', 
                User: {
                    UserID: user.userId,
                    Username : user.username,
                    Email: user.email,
                    Password: user.hashedPassword,
                    AccountType: user.accountType,
                    
                }
            });
        } else {
            return res.status(400).json({
                message: "User not found"
            });
        }
    } catch (error) {
        console.error("Error checking if user exists: ", error);
        return res.status(500).send("Server error");
    }
};

// Controller function to get a user by their ID
const getUserById = async (req, res) => {
    const UserID = req.params.id;

    try {
        const user = await User.getUserById(UserID);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({
                message: "User not found"
            });
        }
    } catch (error) {
        console.error("Error fetching user by ID: ", error);
        res.status(500).send("Server error");
    }
};

//Controller function to add a new user
const addNewUser = async (req, res) => {
    const { Username, Email, Password, AccountType } = req.body; // Extracting user details from request body

    try {
        const newUser = { Username, Email, Password, AccountType }; // Creating a new user object

        const userAdded = await User.addNewUser(newUser); // Adding new user to the database
        if (userAdded) {
            res.status(201).json({ message: "User registered successfully" });
        } else {
            res.status(400).json({ message: "Error creating user" });
        }
    } catch (error) {
        console.error("Error creating user: ", error);
        res.status(500).json({ message: "Error occurred. Unable to create user"});
    }
};

//Controller function to authenticate user login
const loginUser = async (req, res) => {
    const { Email, Password } = req.body; // Extracting email and password from request body
    try {
        const userLogin = { Email, Password }; // Creating user login object
        const loggingUser = await User.loginUser(userLogin); // Attempting to log in the user
        if (loggingUser) {
            res.status(201).json({ message: "User login successfully"});
        } else {
            res.status(400).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.error("Error logging user in: ", error);
        res.status(500).json({ message: "Error logging user in" });
    }
};
 
// Exporting all controller functions
module.exports = {
    getAllUser,
    checkUser,
    getUserById,
    addNewUser,
    loginUser,
}

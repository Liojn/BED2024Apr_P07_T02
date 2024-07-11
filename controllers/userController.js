// Imports
const User = require("../models/user");
// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();


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
    const { Email, Password } = req.body;
    try {
        const userLogin = { Email, Password };
        const loggingUser = await User.loginUser(userLogin);
        if (loggingUser) {
            const token = jwt.sign(
                { id: loggingUser.userId, accountType: loggingUser.accountType },
                process.env.JWT_SECRET
            );
            res.status(200).json({ 
                message: "User login successful", 
                token, 
                user: {
                    userId: loggingUser.userId,
                    username: loggingUser.username,
                    email: loggingUser.email,
                    accountType: loggingUser.accountType
                }
            });
        } else {
            res.status(400).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.error("Error logging user in: ", error);
        res.status(500).json({ message: "Error logging user in" });
    }
};

//Controller function to update a user 
const updateUser = async (req, res) => {
    const { UserID } = req.params;
    const { Username, Email, Password, AccountType } = req.body;

    console.log("Request to update user: ", { UserID, Username, Email, Password, AccountType });
    
    try {
        const existingUser = await User.getUserById(UserID);
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const updatedUser = {
            Username: Username,
            Email: Email,
            Password: Password,
            AccountType: AccountType
        };

        const result = await User.updateUser(UserID, updatedUser);

        if (result) {
            console.log("User successfully updated: ", result);
            res.status(200).json({ message: "User updated successfully", user: result });
        } else {
            console.log("User not updated");
            res.status(400).json({ message: "User information not updated" });
        }
    } catch (error) {
        console.error("Error updating user: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//Controller function to delete a user 
const deleteUser = async (req, res) => {
    const { UserID } = req.params;

    try {
        const success = await User.deleteUser(UserID);

        if (success) {
            res.status(200).json({ message: "User deleted successfully" });
        } else {
            res.status(400).json({ message: "Error deleting user" });
        }
    } catch (error) {
        console.error("Error deleting user: ", error);
        res.status(500).json({ message: "Server error "});
    }
};
 
// Exporting all controller functions
module.exports = {
    getAllUser,
    checkUser,
    getUserById,
    addNewUser,
    loginUser,
    updateUser,
    deleteUser,
}

const User = require("../models/user");
const bcrypt = require('bcrypt');
 
const getAllUser = async (req, res) => {
    try {
        const user = await User.getAllUser();
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving users");
    }
};

const checkUser = async (req, res) => {
    const { Email } = req.query;

    if (!Email) {
        return res.status(400).send("Email is required");
    }
    
    try {
        const user = await User.checkUser(Email);

        if (user) {
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


const addNewUser = async (req, res) => {
    const newUser = { 
        Username: req.body.Username, 
        Email: req.body.Email,
        Password: req.body.Password,
        AccountType: req.body.AccountType
    };  

    try {
        const userAdded = await User.addNewUser(newUser);
        if (userAdded) {
            res.status(201).send("User created successfully");
        } else {
            res.status(400).send("Error creating user");
        }
    } catch (error) {
        console.error("Error creating user: ", error);
        res.status(500).send("Error occured");
    }
};


const loginUser = async (req, res) => {
    const userLogin = {
        Email: req.body.Email,
        Password: req.body.Password
    };

    try {
        const loggingUser = await User.loginUser(userLogin);
        if (loggingUser) {
            res.status(201).send("Login successfully");
        } else {
            res.status(400).send("Invalid email or password");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error logging user in");
    }
};
 

module.exports = {
    getAllUser,
    checkUser,
    getUserById,
    addNewUser,
    loginUser,
}

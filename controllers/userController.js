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
                    Password: user.password,
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

/*
const addNewUser = async (req, res) => {
    const newUser = req.body;

    try {
        const existingUser = await User.checkUser(email);
        
        if (existingUser) {
            return res.status(400).send("User with this email already exists. Try logging in");
        }

        const userAdded = await User.addNewUser(username, email, password);
        if (userAdded) {
            res.status(201).send("User added successfully");
        } else {
            res.status(400).send("Error adding user");
        }
    } catch (error) {
        console.error(error)
        res.status(500).send("Error occured")
    }
};

const getUserByEmail = async (req, res) => {
    const { email, password } = req.query;
    try {
        const user = await User.getUserByEmail(email);
        
        if (await bcrypt.compare(user.password === password)) {
            res.status(200).send("Login successful");
        } else {
            res.status(401).send("Invalid email or password");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error logging in");
    }
};
*/

module.exports = {
    getAllUser,
    checkUser,
    getUserById,
    //addNewUser,
    //getUserByEmail,
}

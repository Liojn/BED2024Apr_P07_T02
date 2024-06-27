const User = require("../models/user");


const getUserByUsername = async (req, res) => {
    const username  = req.params.userId;

    console.log(username); //testing

    try{
        const user = await User.getUserByUsername(username);
        if (!user){
            return res.status(404).send({ message: "User not found" }); 
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error retrieving User"});
    }
}

const registerUser = async (req, res) => {
    //extract data from req object into distinct variables.
    const { username, password, role } = req.body;
    try{
        const newUser = await User.registerUser(username, password, role);
        res.status(201).json({ message: "User created successfully" });
    } catch(error) {
        console.error(error);
        if (error === "Username already exists"){
            res.status(400).json({ message: "Username already exists" })
        }
        res.status(500).send("Error creating user");
    }


}

module.exports = {
    getUserByUsername,
    registerUser,
}

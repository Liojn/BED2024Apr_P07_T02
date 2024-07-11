// Imports
const dbConfig = require("../dbConfig");
const sql = require("mssql");
const bcrypt = require('bcrypt');

 class User {
    constructor(userId, username, email, hashedPassword, accountType) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.hashedPassword = hashedPassword;
        this.accountType = accountType;
    }

    // Static method to fetch all users from the database
    static async getAllUser() {
        const connection = await sql.connect(dbConfig); // Connection to the database

        const sqlQuery = `SELECT * FROM Users`; // SQL query to select all users

        const request = connection.request(); // Creating request object
        const result = await request.query(sqlQuery); // Executing the query

        connection.close();

        // Mapping query results to User objects 
        return result.recordset.map(
            (row) => new User(row.UserID, row.Username, row.Email, row.Password, row.AccountType)
        );
    }

    // Static method to check if the user exists based on email
    static async checkUser(Email) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery =`SELECT * FROM Users WHERE Email = @Email`;
        
        const request = connection.request();
        request.input("Email", Email); // Adding email as a parameter
        
        const result = await request.query(sqlQuery);

        if (result.recordset.length === 0) {
            return null; // Return null if no user is found
        }

        const userRecord = result.recordset[0]; // Fetching the first user record, assuming email are unique 
        return new User(userRecord.UserID, userRecord.Username, userRecord.Email, userRecord.Password, userRecord.AccountType);
    }

    // static method to get a user by their ID
    static async getUserById(UserID) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);

            const sqlQuery = `SELECT * FROM Users WHERE UserID = @UserID`;
            
            const request = connection.request();
            request.input("UserID", UserID);

            const result = await request.query(sqlQuery);
            
            if(result.recordset.length === 0) {
                console.log("No user found with ID: ", UserID);
                return null; // Return null if no user is found 
            }

            const userRecord = result.recordset[0];
            return new User(userRecord.UserID, userRecord.Username, userRecord.Email, userRecord.Password, userRecord.AccountType);
        
        } catch (error) { // Handling exceptions
            console.error("Error fetching user by ID: ", error);
            throw error;
        
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    // Static method to add a new user to the database
    static async addNewUser(newUser) {
        const existingUser = await this.checkUser(newUser.Email); // Checking if the user with the email already exists
        if (existingUser) {
            throw new Error("User has already been registered with the email"); // Assuming each email is unique
        }
        
        const salt = await bcrypt.genSalt(10); // Generating salt for password hashing
        const hashedPassword = await bcrypt.hash(newUser.Password, salt); // Hashing the password
        
        let connection;
        try{
            connection = await sql.connect(dbConfig);
            
            const sqlQuery = `INSERT INTO Users (Username, Email, Password, AccountType) VALUES (@Username, @Email, @Password, @AccountType); SELECT SCOPE_IDENTITY() AS UserID;`;
            
            const request = connection.request(); // Creating a request object and adding in below as paramenter
            // console.log(newUser);
            request.input("Username", newUser.Username);
            request.input("Email", newUser.Email);
            request.input("Password", hashedPassword);
            request.input("AccountType", newUser.AccountType);

            const result = await request.query(sqlQuery);
            // console.log("Query results: ", result);
            connection.close();

            // Checking if the user was successfully created and returning a User Object
            if (result.rowsAffected && result.rowsAffected[0] > 0) {
                const row = result.recordset[0]; 
                return new User(row.UserID, newUser.Username, newUser.Email, hashedPassword, newUser.AccountType);
            } else { 
                console.log("User not created");
                return null; // Log message and return null if user was not created
            }
            
        } catch (error) { // Exception handling
            console.error("Error creating new user: ", error);
            throw error; 
        }
    }

    // Static method to authenticate a user login
    static async loginUser(userLogin) {
        const existingUser = await this.checkUser(userLogin.Email);
        // If the user is already created with the entered Email in the database, return null
        if (!existingUser) {
            console.log("User not found");
            return null;
        }

        const passwordMatch = await bcrypt.compare(userLogin.Password, existingUser.hashedPassword); // Comparing hashed passwords
        if (passwordMatch) {
            console.log("Login successful");
            return existingUser;
        } else {
            console.log("Password incorrect");
            return null;
        }
    }

    // Static method to update a user in the database
    static async updateUser(userId, updatedUser) {
        const connection = await sql.connect(dbConfig);
        try {
            if (updatedUser.Password) {
                const salt = await bcrypt.genSalt(10);
                updatedUser.Password = await bcrypt.hash(updatedUser.Password, salt);
            }
            const sqlQuery = `UPDATE Users SET Username = @Username, Email = @Email, Password = @Password, AccountType = @AccountType WHERE UserID = @UserID`;
            const request = connection.request();
            request.input("UserID", userId);
            request.input("Username", updatedUser.Username);
            request.input("Email", updatedUser.Email);
            request.input("Password", updatedUser.Password);
            request.input("AccountType", updatedUser.AccountType);

            const result = await request.query(sqlQuery);
            connection.close();

            // Checking if the user was successfully created and returning a User Object
            if (result.rowsAffected && result.rowsAffected[0] > 0) {
                console.log("User successfully updated: ", updatedUser);
                return updatedUser;
            } else { 
                console.log("User not updated");
                return null; // Log message and return null if user was not created
            }
        } catch (error) {
            console.error("Error updating user: ", error);
            throw error;
        }
    }

    // Static method to delete a user from the database
    static async deleteUser(userId) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `DELETE FROM Users WHERE UserID = @UserID`;

        const request = connection.request();
        request.input("UserID", userId);

        const result = await request.query(sqlQuery);
        connection.close();

        return result.rowsAffected[0] > 0;
    }
}

module.exports = User;
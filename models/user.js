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

    static async updateUser(userId, updatedFields) {
        let connection;
        try { 
            connection = await sql.connect(dbConfig);

            console.log("Updating user: ", userId);
            console.log("Fields to update: ", updatedFields);
            
            if (Object.keys(updatedFields).length === 0) {
                console.log("No fields to update");
                return await this.getUserById(userId);
            }

            let updateQuery = 'UPDATE Users SET ';
            const request = connection.request();
            
            Object.keys(updatedFields).forEach((key, index) => {
                const dbField = key === 'username' ? 'Username' : (key === 'email' ? 'Email': key);
                updateQuery += `${dbField} = @${key}`;
                request.input(key, updatedFields[key]);
                if (index < Object.keys(updatedFields).length - 1) {
                    updateQuery += ', ';
                }
            });
    
            updateQuery += ' WHERE UserID = @UserID';
            request.input('UserID', userId);

            console.log("Executing query: ", updateQuery);
            console.log("With parameters: ", request.parameters); 
    
            const result = await request.query(updateQuery);
    
            console.log("Update result: ", result);

            if (result.rowsAffected[0] > 0) {
                return await this.getUserById(userId);
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error updating user: ", error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    static async updateProfilePicture(userId, picturePath) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            
            const checkQuery = 'SELECT id FROM ProfilePictures WHERE userId = @userId';
            const checkRequest = connection.request();
            checkRequest.input('userId', sql.Int, userId);
            const checkResult = await checkRequest.query(checkQuery);
    
            let query;
            const request = connection.request();
            request.input('userId', sql.Int, userId);
            request.input('picturePath', sql.NVarChar, picturePath);
    
            if (checkResult.recordset.length > 0) {
                // Update existing profile picture
                query = 'UPDATE ProfilePictures SET picturePath = @picturePath, updatedAt = GETDATE() WHERE userId = @userId';
            } else {
                // Insert new profile picture
                query = 'INSERT INTO ProfilePictures (userId, picturePath) VALUES (@userId, @picturePath)';
            }
    
            await request.query(query);
    
            return true;
        } catch (error) {
            console.error("Error updating profile picture: ", error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async deleteUser(userId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            
            const deleteQuery = 'DELETE FROM Users WHERE UserID = @UserID';
            const request = connection.request();
            request.input('UserID', userId);
    
            const result = await request.query(deleteQuery);
    
            return result.rowsAffected[0] > 0;
        } catch (error) {
            console.error("Error deleting user: ", error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
}

module.exports = User;
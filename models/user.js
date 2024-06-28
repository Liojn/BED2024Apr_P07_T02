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

    static async getAllUser() {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Users`;

        const request = connection.request();
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset.map(
            (row) => new User(row.UserID, row.Username, row.Email, row.Password, row.AccountType)
        );
    }

    static async checkUser(Email) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery =`SELECT * FROM Users WHERE Email = @Email`;
        
        const request = connection.request();
        request.input("Email", Email);
        
        const result = await request.query(sqlQuery);

        if (result.recordset.length === 0) {
            return null;
        }

        const userRecord = result.recordset[0];
        return new User(userRecord.UserID, userRecord.Username, userRecord.Email, userRecord.Password, userRecord.AccountType);
    }

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
                return null;
            }

            const userRecord = result.recordset[0];
            return new User(userRecord.UserID, userRecord.Username, userRecord.Email, userRecord.Password, userRecord.AccountType);
        
        } catch (error) {
            console.error("Error fetching user by ID: ", error);
            throw error;
        
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async addNewUser(newUser) {
        const existingUser = await this.checkUser(newUser.Email);
        if (existingUser) {
            throw new Error("User has already been registered with the email"); // Assuming each email is unique
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newUser.Password, salt);
        
        let connection;
        try{
            connection = await sql.connect(dbConfig);
            
            const sqlQuery = `INSERT INTO Users (Username, Email, Password, AccountType) VALUES (@Username, @Email, @Password, @AccountType); SELECT SCOPE_IDENTITY() AS UserID;`;
            
            const request = connection.request();
            // console.log(newUser);
            request.input("Username", newUser.Username);
            request.input("Email", newUser.Email);
            request.input("Password", hashedPassword);
            request.input("AccountType", newUser.AccountType);

            const result = await request.query(sqlQuery);
            // console.log("Query results: ", result);
            connection.close();

            if (result.rowsAffected && result.rowsAffected[0] > 0) {
                const row = result.recordset[0];
                return new User(row.UserID, newUser.Username, newUser.Email, hashedPassword, newUser.AccountType);
            } else {
                console.log("User not created");
                return null;
            }
            
        } catch (error) {
            console.error("Error creating new user: ", error);
            throw error; 
        }
    }

    static async loginUser(userLogin) {
        const existingUser = await this.checkUser(userLogin.Email);
        if (!existingUser) {
            console.log("User not found");
            return null;
        }

        const passwordMatch = await bcrypt.compare(userLogin.Password, existingUser.hashedPassword);
        if (passwordMatch) {
            console.log("Login successful");
            return existingUser;
        } else {
            console.log("Password incorrect");
            return null;
        }
    }

}

module.exports = User;
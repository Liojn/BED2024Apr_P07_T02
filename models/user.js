const dbConfig = require("../dbConfig");
const sql = require("mssql");
const bcrypt = require('bcrypt');

class User {
    constructor(userId, username, email, password) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.password = password;
    }

    static async getAllUser() {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Users`;

        const request = connection.request();
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset.map(
            (row) => new User(row.UserID, row.Username, row.Email, row.Password)
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
        return new User(userRecord.UserID, userRecord.Username, userRecord.Email, userRecord.Password);
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
            return new User(userRecord.UserID, userRecord.Username, userRecord.Email, userRecord.Password);
        
        } catch (error) {
            console.errror("Error fetching user by ID: ", error);
            throw error;
        
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async addNewUser(newUser) {
        try{
            connection = await sql.connect(dbConfig);
        
            const hashedPassword = await bcrypt.hash(newUser.Password, 10);
            const sqlQuery = `INSERT INTO Users (Username, Email, Password) VALUES (@Username, @EMail, @Password); SELECT SCOPE_IDENTITY() AS UserID;`;
            
            const request = connection.request();
            request.input("Username", newUser.Username);
            request.input("Email", newUser.Email);
            request.input("Password", hashedPassword);

            const result = await request.query(sqlQuery);
            connection.close();

            if (result.rowAffected[0] === 0) {
                console.log("User not created");
            }

            const row = result.recordset[0];
            return new User(row.UserID, row.Username, row.Email, row.Password)

        } catch (error) {
            console.error("Error creating new user: ", error);
            throw error;
        }
    }

    /*static async getUserByEmail(email){
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Users WHERE Email = @Email`;

        const request = connection.request();
        request.input('Email', email);

        const result = await request.query(sqlQuery);
        
        connection.close()
        if (result.recordset.length === 0) {
            return null;
        }
        const row = result.recordset[0];
        return new User(row.UserID, row.Username, row.Email, row.Password);
    }*/
}

module.exports = User;
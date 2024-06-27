const sql = require("mssql");
const dbConfig = require("../dbConfig");
const bcrypt = require("bcryptjs");

class User {
    constructor(user_id, username, passwordHash, role){
        this.user_id = user_id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    //Method for getting user by username
    static async getUserByUsername(username){
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Users WHERE username = @username`; // Parameterized query, indicate parameter
    
        const request = connection.request();
        request.input("username", username); 
        const result = await request.query(sqlQuery);
    
        connection.close();
    
        return result.recordset[0]
          ? new User(
              result.recordset[0].user_id,
              result.recordset[0].username,
              result.recordset[0].passwordHash,
              result.recordset[0].role,
            )
          : null; // Handle user not found
    }

    static async registerUser(username, password, role){
        const existingUser = await this.getUserByUsername(username);
        if (existingUser){
            throw new Error("Username already exists");
        }

        //Hashing of password
        const salt = await bcrypt.genSalt(10); //generates a salt with 10 rounds, salt => a random value added
        const hashedPassword = await bcrypt.hash(password, salt); //hashes the password using the generated salt 
        //console.log("salt ok");
        //Create onto DB
        const connection = await sql.connect(dbConfig);
        try{
            const sqlQuery = `INSERT INTO Users (username, passwordHash, role) VALUES (@username, @hashedPassword, @role)`; // Parameterized query, indicate parameter
        
            const request = connection.request();
            request.input("username", username); 
            request.input("hashedPassword", hashedPassword);
            request.input("role", role);
    
            const result = await request.query(sqlQuery);
            //console.log("db ok");
    
            connection.close();

            return this.getUserByUsername(username);
        } catch (error){
            connection.close();
            throw new Error("Internal server error");
        } 
    }
}


module.exports = User;
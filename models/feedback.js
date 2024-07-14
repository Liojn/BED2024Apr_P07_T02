const { verify } = require("jsonwebtoken");
const dbConfig = require("../dbConfig");
const sql = require("mssql");

class Feedback {
    constructor(Fid, username, email, title, feedback, verified, date) {
        this.Fid = Fid;
        this.username = username;
        this.email = email;
        this.title = title;
        this.feedback = feedback;
        this.verified = verified;
        this.date = date;
    }

    static async getAllFeedbacks() {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Feedback`;
        const request = connection.request();
        const result = await request.query(sqlQuery);
        connection.close();
        console.log(result)
    
        return result.recordset.map((row) => {
            const formattedDate = Feedback.formatDate(new Date(row.Date));
            return new Feedback(row.Fid, row.Username, row.Email, row.Title, row.Feedback, row.Verified, formattedDate);
        });
    }

    static formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    }

    static async getFeedbackById(Fid) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Feedback WHERE Fid = @Fid`;
        const request = connection.request();
        request.input("Fid", Fid);
        const result = await request.query(sqlQuery);
        connection.close();

        return result.recordset[0]
            ? new Feedback(
                result.recordset[0].Fid,
                result.recordset[0].Username,
                result.recordset[0].Email,
                result.recordset[0].Title,
                result.recordset[0].Feedback,
                result.recordset[0].Verified,
                result.recordset[0].Date
            )
            : null;
    }

    static async getFeedbackByVerified(verified) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Feedback WHERE Verified = @verified`;
        const request = connection.request();
        request.input("verified", verified);
        const result = await request.query(sqlQuery);
        connection.close();
        
        return result.recordset.map((row) => {
            const formattedDate = Feedback.formatDate(new Date(row.Date));
            return new Feedback(row.Fid, row.Username, row.Email, row.Title, row.Feedback, row.Verified, formattedDate);
        });
    }

    static async deleteFeedback(Fid) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `DELETE FROM Feedback WHERE Fid = @Fid`;
        const request = connection.request();
        request.input("Fid", Fid);
        const result = await request.query(sqlQuery);
        connection.close();

        return result.rowsAffected > 0;
    }

    static async createFeedback(newFeedbackData) {
        console.log("New Feedback Data:", newFeedbackData); // Add this line
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `INSERT INTO Feedback (Username, Email, Title, Feedback, Verified, Date) 
                          VALUES (@username, @email, @title, @feedback, @verified, @date); 
                          SELECT SCOPE_IDENTITY() AS Fid;`;
        const request = connection.request();
        request.input("username", newFeedbackData.username);
        request.input("email", newFeedbackData.email);
        request.input("title", newFeedbackData.title);
        request.input("feedback", newFeedbackData.feedback);
        request.input("verified", newFeedbackData.verified);
        request.input("date", newFeedbackData.date);
        const result = await request.query(sqlQuery);
        connection.close();
    
        console.log("Inserted Feedback Result:", result); // Add this line
    
        return this.getFeedbackById(result.recordset[0].Fid);
    }

    static async updateFeedback(Fid) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `UPDATE Feedback SET Verified = 'Y' WHERE Fid = @Fid`; // Parameterized query
    
        const request = connection.request();
        request.input("Fid", Fid);
    
        await request.query(sqlQuery);
    
        connection.close();
    
        return this.getFeedbackById(Fid); // returning the updated book data
      }
}

module.exports = Feedback;

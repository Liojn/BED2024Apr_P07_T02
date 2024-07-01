const { verify } = require("jsonwebtoken");
const dbConfig = require("../dbConfig");
const sql = require("mssql");

class Feedback {
    constructor(Fid, name, email, title, feedback, verified, date) {
        this.Fid = Fid;
        this.name = name;
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
    
        return result.recordset.map((row) => {
            const formattedDate = Feedback.formatDate(new Date(row.date));
            return new Feedback(row.Fid, row.name, row.email, row.title, row.feedback, row.verified, formattedDate);
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
                result.recordset[0].name,
                result.recordset[0].email,
                result.recordset[0].title,
                result.recordset[0].feedback,
                result.recordset[0].verified,
                result.recordset[0].date
            )
            : null;
    }

    static async getFeedbackByVerified(verified) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Feedback WHERE verified = @verified`;
        const request = connection.request();
        request.input("verified", verified);
        const result = await request.query(sqlQuery);
        connection.close();
        
        return result.recordset.map((row) => {
            const formattedDate = Feedback.formatDate(new Date(row.date));
            return new Feedback(row.Fid, row.name, row.email, row.title, row.feedback, row.verified, formattedDate);
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
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `INSERT INTO Feedback (name, email, title, feedback, verified, date) VALUES (@name, @email, @title, @feedback, @verified, @date); SELECT SCOPE_IDENTITY() AS Fid;`;
        const request = connection.request();
        request.input("name", newFeedbackData.name);
        request.input("email", newFeedbackData.email);
        request.input("title", newFeedbackData.title);
        request.input("feedback", newFeedbackData.feedback);
        request.input("verified", newFeedbackData.verified);
        request.input("date", newFeedbackData.date);
        const result = await request.query(sqlQuery);
        connection.close();

        return this.getFeedbackById(result.recordset[0].Fid);
    }
}

module.exports = Feedback;

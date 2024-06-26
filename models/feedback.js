const dbConfig = require("../dbConfig");
const sql = require("mssql");

class Feedback {
    constructor(Fid, name, email, title, feedback, verified) {
        this.Fid = Fid;
        this.name = name;
        this.email = email;
        this.title = title;
        this.feedback = feedback;
        this.verified = verified;
    }

    static async getAllFeedbacks() {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Feedback`;
        const request = connection.request();
        const result = await request.query(sqlQuery);
        connection.close();

        return result.recordset.map(
            (row) => new Feedback(row.Fid, row.name, row.email, row.title, row.feedback, row.verified)
        );
    }

    
    static async getFeedbackById(Fid){
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Feedback WHERE Fid = @Fid`; // Parameterized query

        const request = connection.request();
        request.input("Fid",Fid);
        const result = await request.query(sqlQuery)

        connection.close();

        return result.recordset[0]
        ? new Feedback(
            result.recordset[0].Fid,
            result.recordset[0].name,
            result.recordset[0].email,
            result.recordset[0].title,
            result.recordset[0].feedback,
            result.recordset[0].verified,   
        )
        : null;
    }

    
    static async deleteFeedback(Fid){
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `DELETE FROM Feedback WHERE Fid = @Fid`; // Parameterized query

        const request = connection.request();
        request.input("Fid",Fid);
        const result = await request.query(sqlQuery);

        connection.close();

        return result.rowsAffected >0;
    }

    
}

module.exports = Feedback;

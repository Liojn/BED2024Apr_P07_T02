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
}

module.exports = Feedback;

const dbConfig = require("../dbConfig");
const sql = require("mssql");

class Donation {
    constructor(id, amount, datetime, company) {
        this.id = id;
        this.amount = amount;
        this.datetime = datetime;
        this.company = company;

    }

    static async getAllDonations() {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM DONATIONS`;
        const request = connection.request();
        const result = await request.query(sqlQuery);
        connection.close();

        return result.recordset.map(
            (row) => new Feedback(row.id, row.amount, row.datetime, row.company)
        );
    }

    
}

module.exports = Donation;
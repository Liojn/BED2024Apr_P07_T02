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
            (row) => new Donation(row.id, row.amount, row.datetime, row.company)
        );
    }

    static async createDonation(donationData){
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `INSERT INTO DONATIONS (amount , datetime, company) VALUES (@amount, @datetime, @company);`;
        const request = connection.request();
        request.input("amount", donationData.amount);
        request.input("datetime", donationData.datetime);
        request.input("company", donationData.company);
        const result = await request.query(sqlQuery);
        connection.close();
        return result.recordset[0]
        ? new Donation(
            result.recordset[0].amount,
            result.recordset[0].datetime,
            result.recordset[0].company,
        )
        :null;
    }
    static async getCount() {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT COUNT(*) FROM DONATIONS`;
        const request = connection.request();
        const result = await request.query(sqlQuery);
        connection.close();

        return result.recordset[0].count;
    }



    
}

module.exports = Donation;
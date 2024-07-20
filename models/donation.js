const dbConfig = require("../dbConfig");
const sql = require("mssql");
const apiKey = '40c8f517-2100-47ec-9aca-4963466a3b51'
const apiUrl = 'https://api.globalgiving.org/api/public/orgservice/all/organizations';
const axios = require('axios');
const User = require("./user");
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

    static async getDonationByUsername(Username) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Donations WHERE Username = @Username`;
        console.log(Username)
        const request = connection.request();
        request.input("Username", Username);
        const result = await request.query(sqlQuery);
        console.log(result)
        connection.close();
        return result.recordset
    }

    static async createDonation(donationData) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `
            INSERT INTO Donations (Username, Email, amount, company, datetime)
            OUTPUT INSERTED.*
            VALUES (@Username, @Email, @amount, @company, @datetime);
        `;
        const request = connection.request();
        request.input("Username", donationData.Username);
        request.input("Email", donationData.Email);
        request.input("amount", donationData.amount);
        request.input("datetime", donationData.datetime);
        request.input("company", donationData.company);
    
        const result = await request.query(sqlQuery);
        console.log(result); // Log the entire result
    
        connection.close();
    
        if (result.recordset.length > 0) {
            return result.recordset[0];
        } else {
            throw new Error("Failed to insert donation");
        }
    }
    
    static async getCount() {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT COUNT(*) FROM DONATIONS`;
        const request = connection.request();
        const result = await request.query(sqlQuery);
        connection.close();

        return result.recordset[0].count;
    }
    static async fetchNonProfitNames() {
        try {
            const response = await axios.get(apiUrl, {
                params: {
                    api_key: apiKey,
                    format: 'json'
                }
            });
    
            const organizations = response.data.organizations.organization;
            return organizations.map(org => org.name);
        } catch (error) {
            console.error('Error fetching non-profit company names:', error.message);
            return [];
        }
    }



    
}

module.exports = Donation;
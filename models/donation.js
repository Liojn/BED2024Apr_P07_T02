const dbConfig = require("../dbConfig");
const sql = require("mssql");
const apiKey = '40c8f517-2100-47ec-9aca-4963466a3b51'
const apiUrl = 'https://api.globalgiving.org/api/public/orgservice/all/organizations?api_key=40c8f517-2100-47ec-9aca-4963466a3b51';
// const apiKey = 'stl8_a2c9adc0263dc5f2d0bed57d31e745cdae1147dc6c6b561499445b247de93bf3'
// const apiUrl = 'https://data.charitynavigator.org'
const axios = require('axios');
const cors = require('cors');

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
        const sqlQuery = `INSERT INTO DONATIONS (Username, Email, amount , datetime, company) VALUES (@Username, @Email, @amount, @datetime, @company);`;
        const request = connection.request();
        request.input("Username", donationData.username);
        request.input("Email", donationData.email);
        request.input("amount", donationData.amount);
        request.input("datetime", donationData.datetime);
        request.input("company", donationData.company);
        const result = await request.query(sqlQuery);
        connection.close();
        return result.recordset[0]
        ? new Donation(
            result.recordset[0].username,
            result.recordset[0].email,
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
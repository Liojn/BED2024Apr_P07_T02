const dbConfig = require("../dbConfig");
const sql = require("mssql");
const apiKey = process.env.NONPROFITAPIKEY; // API key for accessing the non-profit data
const apiUrl = 'https://api.globalgiving.org/api/public/orgservice/all/organizations'; // URL for fetching non-profit organizations
const axios = require('axios');
const User = require("./user");

class Donation {
    constructor(id, amount, datetime, company) {
        this.id = id;
        this.amount = amount;
        this.datetime = datetime;
        this.company = company;
    }

    // Retrieve all donations from the database
    static async getAllDonations() {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM DONATIONS`;
        const request = connection.request();
        const result = await request.query(sqlQuery);
        connection.close();
        console.log(result);
        return result.recordset;
    }

    // Retrieve statistics about the donations
    static async getAllStats() {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT COUNT(*) as numberOfDonations, 
               AVG(amount) as averageDonation, 
               SUM(amount) as totalDonations, 
               MAX(amount) as largestSingleDonation 
        FROM Donations;`;
        const request = connection.request();
        const result = await request.query(sqlQuery);
        connection.close();
        return result.recordset;
    }

    // Retrieve donations by a specific username
    static async getDonationByUsername(Username) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Donations WHERE Username = @Username`;
        console.log(Username);
        const request = connection.request();
        request.input("Username", Username);
        const result = await request.query(sqlQuery);
        connection.close();
        return result.recordset;
    }

    // Create a new donation record in the database
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
        connection.close();
    
        if (result.recordset.length > 0) {
            return result.recordset[0]; // Return the inserted record
        } else {
            throw new Error("Failed to insert donation");
        }
    }

    // Get the count of all donations
    static async getCount() {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT COUNT(*) as numberOfDonations FROM DONATIONS`;
        const request = connection.request();
        const result = await request.query(sqlQuery);
        connection.close();

        if (result.recordset && result.recordset.length > 0) {
            return {
                count: result.recordset[0].count,
            };
        }
    }

    // Fetch names of non-profit organizations using an external API
    static async fetchNonProfitNames() {
        try {
            const response = await axios.get(apiUrl, {
                params: {
                    api_key: apiKey,
                    format: 'json'
                }
            });
    
            const organizations = response.data.organizations.organization;
            // Map the organization data to extract names
            return organizations.map(org => org.name);
        } catch (error) {
            console.error('Error fetching non-profit company names:', error.message);
            return [];
        }
    }
}

module.exports = Donation; // Export the Donation class for use in other modules

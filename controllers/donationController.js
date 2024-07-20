const { user } = require("../dbConfig");
const Donation = require("../models/donation");

const getAllDonations = async (req, res) => {
    try {
        const donations = await Donation.getAllDonations();
        res.json(donations);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving donations");
    }
};

const getDonationByUsername = async (req, res) => {
    const username = req.params.username;
    try {
        const donation = await Donation.getDonationByUsername(username);
        if (!donation) {
            return res.status(404).send("Donation not found");
        }
        res.json(donation);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving donation");
    }
};



const createDonation = async (req, res) => {
    const newDonation = req.body;
    try {
        const createdDonation = await Donation.createDonation(newDonation);
        res.status(201).json(createdDonation);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating donation");
    }
};

const getDonationCount = async (req, res) => {
    try {
        const donationCount = await Donation.getDonationCount();
        res.status(201).json(donationCount);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error getting donation");
    }
}

const fetchNonProfitNames = async (req, res) => {
    try {
        const nonProfitNames = await Donation.fetchNonProfitNames();
        res.status(201).json(nonProfitNames);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error getting non-profit names");
    }
}

const getRealTimeDonation = async(req,res) => {
    try {
        const realTimeDonation = await Donation.getRealTimeDonation();
        res.status(201).json(realTimeDonation);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error getting real time donations");
    }
}

module.exports = {
    getAllDonations,
    getDonationByUsername,
    createDonation,
    getDonationCount,
    fetchNonProfitNames,
    getRealTimeDonation,
};

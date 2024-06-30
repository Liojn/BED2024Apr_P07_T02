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

const createDonation = async (req, res) => {
    const newDonation = req.body;
    try {
        const createdDonation = await Donation.createDonation(newDonation);
        res.status(201).json(createdDonation);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating donation");
    }
}

const getDonationCount = async (req, res) => {
    try {
        const donationCount = await Donation.getDonationCount();
        res.status(201).json(donationCount);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error getting donation");
    }
}

module.exports = {
    getAllDonations,
    createDonation,
    getDonationCount,
};

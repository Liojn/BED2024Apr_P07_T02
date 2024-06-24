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

module.exports = {
    getAllDonations,
};

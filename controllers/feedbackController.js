const Feedback = require("../models/feedback");

const getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.getAllFeedbacks();
        res.json(feedbacks);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving feedbacks");
    }
};

module.exports = {
    getAllFeedbacks,
};

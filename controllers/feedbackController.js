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

const deleteFeedback = async (req, res) => {
    const Fid = parseInt(req.params.id);
  
    try {
      const success = await Feedback.deleteBook(Fid);
      if (!success) {
        return res.status(404).send("Feedback not found");
      }
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).send("Error deleting feedback");
    }
  };

module.exports = {
    getAllFeedbacks,
    deleteFeedback,
};

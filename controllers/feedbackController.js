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

const getFeedbackById = async (req, res) => {
  const Fid = parseInt(req.params.id);
  try {
    const fb = await Feedback.getFeedbackById(Fid);
    if (!fb) {
      return res.status(404).send("Feedback not found");
    }
    res.json(fb);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving feedback");
  }
};

const getFeedbackByVerified = async (req, res) => {
  const verified = req.params.verified;
  try {
    const fb = await Feedback.getFeedbackByVerified(verified);
    if (!fb) {
      return res.status(404).send("Verified Feedback not found");
    }
    res.json(fb);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving verified feedback");
  }
};

const deleteFeedback = async (req, res) => {
    const Fid = parseInt(req.params.id);
  
    try {
      const success = await Feedback.deleteFeedback(Fid);
      if (!success) {
        return res.status(404).send("Feedback not found");
      }
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).send("Error deleting feedback");
    }
  };

const createFeedback = async (req, res) => {
    const newFeedback = req.body;
    try {
      const createdFeedback = await Feedback.createFeedback(newFeedback);
      res.status(201).json(createdFeedback);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error creating Feedback");
    }
  };

  

module.exports = {
    getAllFeedbacks,
    getFeedbackByVerified,
    getFeedbackById,
    deleteFeedback,
    createFeedback,
};

const Feedback = require("../models/feedback");

const getAllFeedback = async (req, res) => {
    try {
      const Feedbacks = await Feedback.getAllBooks();
      res.json(Feedbacks);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error retrieving Feedbacks");
    }
  };
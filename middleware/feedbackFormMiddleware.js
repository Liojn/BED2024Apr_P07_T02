const Joi = require('joi');

// Define the schema for the feedback form
const feedbackSchema = Joi.object({
  Username: Joi.string().max(255).required(),
  Email: Joi.string().email().max(255).required(),
  Title: Joi.string().max(100).required(),
  Feedback: Joi.string().max(300).required(),
  Verified: Joi.string().valid('Y', 'N').required(),
  Date: Joi.date().required()
});

// Middleware function to validate feedback form
const feedbackFormMiddleware = (req, res, next) => {
  const { error } = feedbackSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    });
  }
  
  next();
};

module.exports = feedbackFormMiddleware;

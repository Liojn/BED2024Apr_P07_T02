const Joi = require('joi');
const moment = require('moment-timezone');

/*   EXAMPLE OF DATA BEING POSTED
    {
        "title": "Orientation Day 2024",
        "date": "2024-07-15",
        "startTime": "08:33",
        "endTime": "10:40",
        "location": "NP LT58A, Atrium Hall",
        "description": "Join us in welcoming our newly joined members for bonding. S points awarded for exisiting members",
    } 
 */
const validateEvent = (req, res, next) => {
    const timezone = 'Asia/Singapore';
    const now = moment().tz(timezone).startOf('day'); // Get the start of today in the timezone
    console.log(now); //JS CODE USES UTC, CONVERT TO SGT
    // Define the schema
    const schema = Joi.object({
        title: Joi.string().min(3).max(250).required(),
        date: Joi.string().isoDate().required().custom((value, helpers) => {
            const eventDate = moment.tz(value, 'UTC').startOf('day'); //No conversion as correct from USER
            console.log(eventDate);
            if (eventDate.isBefore(now)) {
                return helpers.message('The event date cannot be earlier than today.');
            }
            return value;
        }),
        startTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
        endTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required().custom((value, helpers) => {
            // Extract start time and end time from request body
            const [startHour, startMinute] = req.body.startTime.split(':').map(Number);
            const [endHour, endMinute] = value.split(':').map(Number);
            
            // Convert start time and end time to minutes for comparison
            const startTimeMinutes = startHour * 60 + startMinute;
            const endTimeMinutes = endHour * 60 + endMinute;
            
            if (endTimeMinutes <= startTimeMinutes) {
                return helpers.message('End time must be later than start time.');
            }
            return value;
        }),
        location: Joi.string()
            .pattern(/^[\w\s]+ \d{6}$/, 'location')
            .required()
            .messages({ //custom message
                'string.pattern.location': 'Location must include an address name followed by a 6-digit postal code.'
            }),
        description: Joi.string().min(10).max(800).required()
    });

    //Validate the request body
    const { error } = schema.validate(req.body, { abortEarly: false });

    // Handle validation errors
    if (error) {
        const errors = error.details.map((detail) => detail.message);
        return res.status(400).json({ message: "Validation error", errors });
    }

    // Proceed to the next middleware or route handler
    next();
}; 

module.exports = validateEvent;

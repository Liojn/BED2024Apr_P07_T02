// Middleware to check if the user has Staff access
const staffAuthMiddleware = (req, res, next) => {
    if (req.accountType === "Staff"){
        next();
    } else {
        res.status(403).json({ message: "Access denied. Staff only. "});
    };
};

module.exports = staffAuthMiddleware;

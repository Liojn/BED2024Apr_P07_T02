const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();


const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log("No token provided");
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log("Failed to authenticate token", err);
            return res.status(500).json({ message: 'Failed to authenticate token' });
        }
        req.userId = decoded.id;
        req.accountType = decoded.accountType;
        next();
    });
};

const staffOnly = (req, res, next) => {
    if (req.accountType == 'staff') {
        return res.status(403).json({ message: 'Access denied: Staff only' });
    }
    next();
};

const studentsOnly = (req, res, next) => {
    if (req.accountType == 'student') {
        return res.status(403).json({ message: 'Access denied: Students only' });
    }
    next();
};


module.exports = { authMiddleware, staffOnly, studentsOnly };

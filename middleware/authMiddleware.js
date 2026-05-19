const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { listedTokens } = require('../controllers/authController');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const SESSION_TIMEOUT = 5 * 60 * 1000;

// const verifySession = (req, res, next) => {
//     if (!req.session.user) {
//         return errorResponse(res, "Not logged in", 401);
//     }
//     req.user = req.session.user;
//     next();
// }

// const autoLogout = (req, res, next) => {
//     const now = Date.now();

//     if (req.session.user) {
//         if (req.session.lastActivity && now - req.session.lastActivity > SESSION_TIMEOUT) {
//             req.session.destroy((err) => {
//                 if (err) {
//                     errorResponse(res, "Logout failed", 500);
//                 }
//             });
//             res.clearCookie('connect.sid');
//             return errorResponse(res, "Session expired due to inactivity")
//         }
//         req.session.lastActivity = now;
//         req.user = req.session.user;

//     }
//     return next();
// }


const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token, access denied" });
        }

        const token = authHeader.split(" ")[1];

        // optional blacklist check
        if (listedTokens.has(token)) {
            return res.status(401).json({ message: "Token expired, login again" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({
            where: {
                id: decoded.id,
                isDeleted: false
            },
            attributes: ["id", "username", "email", "role"]
        });

        if (!user) {
            return res.status(401).json({ message: "Account no longer active" });
        }

        console.log("TOKEN:", token);
        console.log("DECODED:", decoded);

        req.user = user; // NOT decoded
        next();

    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

// const verifyToken = (req, res, next) => {
//     const authHeader = req.headers['authorization'];

//     if (!authHeader) {
//         return res.status(401).json({ message: "No token, access denied" });
//     }

//     const token = authHeader.startsWith('Bearer ')
//         ? authHeader.slice(7)
//         : authHeader;

//     if (blacklistedTokens.has(token)) {
//         return res.status(401).json({ message: "Token expired, please login again" });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded;
//         next();
//     } catch (err) {
//         return res.status(401).json({ message: "Invalid or expired token" });
//     }
// };

const isCreator = (req, res, next) => {
    if (!req.user || req.user.role !== 'creator') {
        return res.status(403).json({
            message: 'Access denied - creators only'
        });
    }
    next();
};

const isUser = (req, res, next) => {
    if (!req.user || req.user.role !== 'user') {
        return res.status(403).json({
            message: 'Access denied - users only'
        });
    }
    next();
}

module.exports = { verifyToken, isCreator, isUser };
const jwt = require("jsonwebtoken");
const { tokenSecret } = require("../config/env");

const verifyToken = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).send({ message: "Sign in to continue." });
    }

    jwt.verify(token, tokenSecret, (err, decoded) => {
        if (err || !decoded?.email) {
            return res.status(401).send({ message: "Your session has expired. Sign in again." });
        }
        req.user = { email: decoded.email.toLowerCase() };
        next();
    });
};

module.exports = verifyToken;

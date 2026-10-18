const jwt = require("jsonwebtoken");
const { tokenSecret, tokenLifetime, cookieOptions } = require("../../config/env");
const { parseEmail } = require("../../utils/validate");

const issueToken = (req, res) => {
    const email = parseEmail(req.body?.email);
    const token = jwt.sign({ email }, tokenSecret, { expiresIn: tokenLifetime });
    res.cookie("token", token, cookieOptions).send({ success: true });
};

const clearToken = (req, res) => {
    res.clearCookie("token", cookieOptions).send({ success: true });
};

module.exports = { issueToken, clearToken };

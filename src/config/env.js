require("dotenv").config();

const REQUIRED = ["DB_USER", "DB_PASSWORD", "ACCESS_TOKEN_SECRET"];

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
}

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
    port: process.env.PORT || 5000,
    isProduction,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    tokenSecret: process.env.ACCESS_TOKEN_SECRET,
    tokenLifetime: "1d",
    clientOrigins: [
        "http://localhost:5173",
        "https://task-buddy-web-application.web.app",
        "https://task-buddy-web-application.firebaseapp.com",
    ],
    cookieOptions: {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "strict",
    },
};

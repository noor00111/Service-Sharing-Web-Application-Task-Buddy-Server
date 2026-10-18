const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { clientOrigins } = require("./config/env");
const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/user.routes");
const listingRoutes = require("./modules/listings/listing.routes");
const bookingRoutes = require("./modules/bookings/booking.routes");
const { notFoundRoute, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.disable("x-powered-by");
app.use(cors({ origin: clientOrigins, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Task Buddy server is running");
});

app.use(authRoutes);
app.use(userRoutes);
app.use(listingRoutes);
app.use(bookingRoutes);

app.use(notFoundRoute);
app.use(errorHandler);

module.exports = app;

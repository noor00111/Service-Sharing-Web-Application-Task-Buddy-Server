const { AppError } = require("../utils/AppError");

const notFoundRoute = (req, res) => {
    res.status(404).send({ message: `No route for ${req.method} ${req.path}` });
};

const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof AppError) {
        return res.status(err.status).send({ message: err.message });
    }

    if (err.type === "entity.parse.failed") {
        return res.status(400).send({ message: "The request body isn't valid JSON." });
    }

    if (err.type === "entity.too.large") {
        return res.status(413).send({ message: "The request is too large." });
    }

    console.error(err);
    res.status(500).send({ message: "Something went wrong on the server. Try again shortly." });
};

module.exports = { notFoundRoute, errorHandler };

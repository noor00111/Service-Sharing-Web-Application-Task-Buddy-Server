const bookingService = require("./booking.service");

const create = async (req, res) => {
    const result = await bookingService.createBooking(req.body, req.user);
    res.status(201).send(result);
};

const getMine = async (req, res) => {
    res.send(await bookingService.listForUser(req.user));
};

const getAsLearner = async (req, res) => {
    res.send(await bookingService.listForLearner(req.query.email, req.user));
};

const getAsProvider = async (req, res) => {
    res.send(await bookingService.listForProvider(req.query.email, req.user));
};

const updateStatus = async (req, res) => {
    res.send(await bookingService.updateStatus(req.params.id, req.body?.serviceStatus, req.user));
};

module.exports = { create, getMine, getAsLearner, getAsProvider, updateStatus };

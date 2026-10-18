const listingService = require("./listing.service");

const getAll = async (req, res) => {
    res.send(await listingService.listAll());
};

const getPopular = async (req, res) => {
    res.send(await listingService.listPopular());
};

const getOne = async (req, res) => {
    res.send(await listingService.findById(req.params.id));
};

const getMine = async (req, res) => {
    res.send(await listingService.listForProvider(req.query.email, req.user));
};

const create = async (req, res) => {
    const result = await listingService.createListing(req.body, req.user);
    res.status(201).send(result);
};

const update = async (req, res) => {
    res.send(await listingService.updateListing(req.params.id, req.body, req.user));
};

const remove = async (req, res) => {
    res.send(await listingService.deleteListing(req.params.id, req.user));
};

module.exports = { getAll, getPopular, getOne, getMine, create, update, remove };

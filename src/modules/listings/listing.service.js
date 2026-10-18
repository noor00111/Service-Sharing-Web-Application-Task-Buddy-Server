const { ObjectId } = require("mongodb");
const { collections } = require("../../config/db");
const { badRequest, conflict, forbidden, notFound } = require("../../utils/AppError");
const { toObjectId, requireText, parseUrl, parsePrice, sameEmail } = require("../../utils/validate");

const POPULAR_LIMIT = 6;
const NAME_MAX = 60;
const DESCRIPTION_MAX = 600;
const AREA_MAX = 80;

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const listAll = () => collections.services.find().toArray();

const findById = async (id) => {
    const service = await collections.services.findOne({ _id: toObjectId(id, "service id") });
    if (!service) {
        throw notFound("That service doesn't exist or was removed.");
    }
    return service;
};

const listPopular = async () => {
    const ranking = await collections.bookings
        .aggregate([
            { $group: { _id: "$serviceId", bookings: { $sum: 1 } } },
            { $sort: { bookings: -1 } },
            { $limit: POPULAR_LIMIT },
        ])
        .toArray();

    const rankedIds = ranking.map((row) => row._id).filter((id) => ObjectId.isValid(id));
    const position = new Map(rankedIds.map((id, index) => [String(id), index]));

    const mostBooked = rankedIds.length
        ? await collections.services.find({ _id: { $in: rankedIds.map((id) => new ObjectId(id)) } }).toArray()
        : [];
    mostBooked.sort((a, b) => position.get(String(a._id)) - position.get(String(b._id)));

    if (mostBooked.length >= POPULAR_LIMIT) {
        return mostBooked;
    }

    const others = await collections.services
        .find({ _id: { $nin: mostBooked.map((service) => service._id) } })
        .limit(POPULAR_LIMIT - mostBooked.length)
        .toArray();

    return [...mostBooked, ...others];
};

const listForProvider = (providerEmail, user) => {
    if (!sameEmail(providerEmail, user.email)) {
        throw forbidden("You can only view your own services.");
    }
    return collections.services
        .find({ "serviceProvider.providerEmail": { $regex: `^${escapeRegex(user.email)}$`, $options: "i" } })
        .toArray();
};

const assertOwner = (service, user) => {
    if (!sameEmail(service.serviceProvider?.providerEmail, user.email)) {
        throw forbidden("Only the provider who listed this service can change it.");
    }
};

const assertUniqueName = async (serviceName, user, exceptId) => {
    const filter = {
        "serviceProvider.providerEmail": { $regex: `^${escapeRegex(user.email)}$`, $options: "i" },
        serviceName: { $regex: `^${escapeRegex(serviceName)}$`, $options: "i" },
    };
    if (exceptId) {
        filter._id = { $ne: exceptId };
    }
    if (await collections.services.findOne(filter)) {
        throw conflict(`You already list a service called “${serviceName}”.`);
    }
};

const createListing = async (input = {}, user) => {
    const provider = input.serviceProvider ?? {};
    const listing = {
        serviceName: requireText(input.serviceName, "Service name", { max: NAME_MAX }),
        serviceDescription: requireText(input.serviceDescription, "Description", { max: DESCRIPTION_MAX }),
        serviceArea: requireText(input.serviceArea, "Service area", { max: AREA_MAX }),
        serviceImage: parseUrl(input.serviceImage, "Image URL"),
        servicePrice: String(parsePrice(input.servicePrice)),
        serviceProvider: {
            providerName: typeof provider.providerName === "string" ? provider.providerName.trim() : "",
            providerImage: typeof provider.providerImage === "string" ? provider.providerImage.trim() : "",
            providerEmail: user.email,
        },
        createdAt: new Date(),
    };

    await assertUniqueName(listing.serviceName, user);
    return collections.services.insertOne(listing);
};

const updateListing = async (id, input = {}, user) => {
    const service = await findById(id);
    assertOwner(service, user);

    const changes = {};
    if (input.serviceName !== undefined) {
        changes.serviceName = requireText(input.serviceName, "Service name", { max: NAME_MAX });
    }
    if (input.serviceDescription !== undefined) {
        changes.serviceDescription = requireText(input.serviceDescription, "Description", {
            max: DESCRIPTION_MAX,
        });
    }
    if (input.servicePrice !== undefined) {
        changes.servicePrice = String(parsePrice(input.servicePrice));
    }

    if (!Object.keys(changes).length) {
        throw badRequest("Send at least one of: service name, description or price.");
    }
    if (changes.serviceName) {
        await assertUniqueName(changes.serviceName, user, service._id);
    }

    return collections.services.updateOne(
        { _id: service._id },
        { $set: { ...changes, updatedAt: new Date() } }
    );
};

const deleteListing = async (id, user) => {
    const service = await findById(id);
    assertOwner(service, user);

    const removedBookings = await collections.bookings.deleteMany({ serviceId: String(service._id) });
    const result = await collections.services.deleteOne({ _id: service._id });

    return { ...result, deletedBookings: removedBookings.deletedCount };
};

module.exports = {
    listAll,
    listPopular,
    findById,
    listForProvider,
    createListing,
    updateListing,
    deleteListing,
};

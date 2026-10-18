const { collections } = require("../../config/db");
const { badRequest, conflict, forbidden, notFound } = require("../../utils/AppError");
const { toObjectId, optionalText, parseBookingDate, sameEmail } = require("../../utils/validate");
const listingService = require("../listings/listing.service");
const { STATUS, OPEN_STATUSES, normalizeStatus, statusQuery, canMoveTo } = require("./booking.status");

const NOTE_MAX = 500;

const emailQuery = (email) => ({ $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" });

const assertSelf = (email, user, what) => {
    if (!sameEmail(email, user.email)) {
        throw forbidden(`You can only view your own ${what}.`);
    }
};

const createBooking = async (input = {}, user) => {
    const service = await listingService.findById(input.serviceId);

    if (sameEmail(service.serviceProvider?.providerEmail, user.email)) {
        throw badRequest("You can't book a service you provide.");
    }

    const serviceDate = parseBookingDate(input.serviceDate);
    const serviceId = String(service._id);

    const alreadyOpen = await collections.bookings.findOne({
        serviceId,
        serviceDate,
        currentUserEmail: emailQuery(user.email),
        serviceStatus: statusQuery(OPEN_STATUSES),
    });
    if (alreadyOpen) {
        throw conflict("You already have an open booking for this service on that date.");
    }

    const booking = {
        serviceId,
        serviceName: service.serviceName,
        serviceImage: service.serviceImage,
        servicePrice: service.servicePrice,
        providerEmail: service.serviceProvider?.providerEmail,
        providerName: service.serviceProvider?.providerName,
        currentUserEmail: user.email,
        currentUserName:
            typeof input.currentUserName === "string" && input.currentUserName.trim()
                ? input.currentUserName.trim()
                : user.email,
        serviceDate,
        specialInstruction: optionalText(input.specialInstruction, "Note", { max: NOTE_MAX }),
        serviceStatus: "pending",
        createdAt: new Date(),
    };

    return collections.bookings.insertOne(booking);
};

const listForUser = (user) =>
    collections.bookings
        .find({ $or: [{ currentUserEmail: emailQuery(user.email) }, { providerEmail: emailQuery(user.email) }] })
        .toArray();

const listForLearner = (email, user) => {
    assertSelf(email, user, "bookings");
    return collections.bookings.find({ currentUserEmail: emailQuery(user.email) }).toArray();
};

const listForProvider = (email, user) => {
    assertSelf(email, user, "booking requests");
    return collections.bookings.find({ providerEmail: emailQuery(user.email) }).toArray();
};

const updateStatus = async (id, requestedStatus, user) => {
    const booking = await collections.bookings.findOne({ _id: toObjectId(id, "booking id") });
    if (!booking) {
        throw notFound("That booking doesn't exist or was removed.");
    }
    if (!sameEmail(booking.providerEmail, user.email)) {
        throw forbidden("Only the provider of this service can update the booking.");
    }

    const next = normalizeStatus(requestedStatus);
    if (!next) {
        throw badRequest("Status must be Pending, Working or Completed.");
    }

    const current = normalizeStatus(booking.serviceStatus) ?? "pending";
    if (current === next) {
        throw badRequest(`This booking is already ${STATUS[next]}.`);
    }
    if (!canMoveTo(current, next)) {
        throw conflict("Completed bookings are closed and can't be reopened.");
    }

    return collections.bookings.updateOne(
        { _id: booking._id },
        { $set: { serviceStatus: STATUS[next], statusUpdatedAt: new Date() } }
    );
};

module.exports = { createBooking, listForUser, listForLearner, listForProvider, updateStatus };

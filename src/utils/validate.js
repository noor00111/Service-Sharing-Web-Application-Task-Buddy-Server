const { ObjectId } = require("mongodb");
const { badRequest } = require("./AppError");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const toObjectId = (id, label = "id") => {
    if (!ObjectId.isValid(id)) {
        throw badRequest(`That ${label} isn't valid.`);
    }
    return new ObjectId(id);
};

const requireText = (value, field, { max = 200 } = {}) => {
    const text = typeof value === "string" ? value.trim() : "";
    if (!text) {
        throw badRequest(`${field} is required.`);
    }
    if (text.length > max) {
        throw badRequest(`${field} must be ${max} characters or fewer.`);
    }
    return text;
};

const optionalText = (value, field, { max = 500 } = {}) => {
    if (value === undefined || value === null || value === "") return "";
    return requireText(String(value), field, { max });
};

const parseEmail = (value, field = "Email") => {
    const email = requireText(value, field, { max: 254 }).toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
        throw badRequest(`${field} isn't a valid email address.`);
    }
    return email;
};

const parseUrl = (value, field) => {
    const text = requireText(value, field, { max: 2048 });
    let url;
    try {
        url = new URL(text);
    } catch {
        throw badRequest(`${field} must be a full link starting with https://`);
    }
    if (!["http:", "https:"].includes(url.protocol)) {
        throw badRequest(`${field} must start with http:// or https://`);
    }
    return text;
};

const parsePrice = (value, { min = 1, max = 1000000 } = {}) => {
    const price = Number(value);
    if (!Number.isInteger(price) || price < min || price > max) {
        throw badRequest(`Price must be a whole number between ${min} and ${max.toLocaleString("en-US")} BDT.`);
    }
    return price;
};

const parseBookingDate = (value) => {
    if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
        throw badRequest("Pick a date for the booking.");
    }
    const date = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) {
        throw badRequest("That date doesn't exist.");
    }

    const earliest = new Date();
    earliest.setUTCHours(0, 0, 0, 0);
    earliest.setUTCDate(earliest.getUTCDate() - 1);
    const latest = new Date(earliest);
    latest.setUTCFullYear(latest.getUTCFullYear() + 1);

    if (date < earliest) {
        throw badRequest("The booking date can't be in the past.");
    }
    if (date > latest) {
        throw badRequest("Bookings can be made up to one year ahead.");
    }
    return value;
};

const sameEmail = (a, b) => typeof a === "string" && typeof b === "string" && a.toLowerCase() === b.toLowerCase();

module.exports = {
    toObjectId,
    requireText,
    optionalText,
    parseEmail,
    parseUrl,
    parsePrice,
    parseBookingDate,
    sameEmail,
};

const STATUS = {
    pending: "Pending",
    working: "Working",
    completed: "Completed",
};

const OPEN_STATUSES = ["pending", "working"];

const normalizeStatus = (value) => {
    const key = String(value ?? "").trim().toLowerCase();
    return STATUS[key] ? key : null;
};

const statusQuery = (keys) => ({ $regex: `^(${keys.join("|")})$`, $options: "i" });

const canMoveTo = (from, to) => {
    if (from === to) return false;
    if (from === "completed") return false;
    return true;
};

module.exports = { STATUS, OPEN_STATUSES, normalizeStatus, statusQuery, canMoveTo };

const { collections } = require("../../config/db");
const { requireText, parseEmail, parseUrl } = require("../../utils/validate");

const registerUser = async (input = {}) => {
    const user = {
        name: requireText(input.name, "Name", { max: 80 }),
        email: parseEmail(input.email),
        photo: input.photo ? parseUrl(input.photo, "Photo URL") : "",
    };

    const result = await collections.users.updateOne(
        { email: user.email },
        { $setOnInsert: { ...user, createdAt: new Date() } },
        { upsert: true }
    );

    return {
        created: result.upsertedCount > 0,
        insertedId: result.upsertedId ?? null,
    };
};

module.exports = { registerUser };

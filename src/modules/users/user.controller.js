const userService = require("./user.service");

const register = async (req, res) => {
    const result = await userService.registerUser(req.body);
    res.status(result.created ? 201 : 200).send(result);
};

module.exports = { register };

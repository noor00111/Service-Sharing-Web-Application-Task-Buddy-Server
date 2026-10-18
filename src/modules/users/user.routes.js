const { Router } = require("express");
const asyncHandler = require("../../utils/asyncHandler");
const { register } = require("./user.controller");

const router = Router();

router.post("/users", asyncHandler(register));

module.exports = router;

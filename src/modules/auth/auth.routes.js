const { Router } = require("express");
const { issueToken, clearToken } = require("./auth.controller");

const router = Router();

router.post("/jwt", issueToken);
router.post("/signout", clearToken);

module.exports = router;

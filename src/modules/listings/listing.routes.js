const { Router } = require("express");
const asyncHandler = require("../../utils/asyncHandler");
const verifyToken = require("../../middleware/verifyToken");
const listings = require("./listing.controller");

const router = Router();

router.get("/allServices", asyncHandler(listings.getAll));
router.get("/services/popular", asyncHandler(listings.getPopular));
router.get("/services/:id", asyncHandler(listings.getOne));
router.post("/services", verifyToken, asyncHandler(listings.create));
router.put("/services/:id", verifyToken, asyncHandler(listings.update));
router.delete("/services/:id", verifyToken, asyncHandler(listings.remove));
router.get("/userServices", verifyToken, asyncHandler(listings.getMine));

module.exports = router;

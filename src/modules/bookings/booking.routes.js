const { Router } = require("express");
const asyncHandler = require("../../utils/asyncHandler");
const verifyToken = require("../../middleware/verifyToken");
const bookings = require("./booking.controller");

const router = Router();

router.use(["/bookService", "/bookedService", "/myService"], verifyToken);

router.post("/bookService", asyncHandler(bookings.create));
router.get("/bookService", asyncHandler(bookings.getMine));
router.put("/bookService/:id", asyncHandler(bookings.updateStatus));
router.get("/bookedService", asyncHandler(bookings.getAsLearner));
router.get("/myService", asyncHandler(bookings.getAsProvider));

module.exports = router;

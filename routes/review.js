const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, validateReview } = require("../middleware");
const reviewController = require("../controllers/reviews");

// ======================
// CREATE REVIEW
// POST /listings/:id/reviews
// ======================
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// ======================
// DELETE REVIEW
// DELETE /listings/:id/reviews/:reviewId
// ======================
router.delete("/:reviewId", isLoggedIn, wrapAsync(reviewController.destroyReview));

module.exports = router;
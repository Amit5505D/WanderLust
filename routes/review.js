const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapasync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

// Validation middleware
const validateReview = (req, res, next) => {
  let {err} = reviewSchema.validate(req.body);
  if(err){
    let errMsg = err.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }else{
    next();
  }
}

router.post(
    "/:id/reviews",
    validateReview,
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        const review = new Review(req.body.review);
        listing.reviews.push(review);
        await review.save();
        await listing.save();
        res.redirect(`/listings/${id}`);
    })
);

router.delete(
    "/:id/reviews/:reviewId",
    wrapAsync(async (req, res) => {
        const { id, reviewId } = req.params;
        
        // Remove the review from the listing's reviews array
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        
        // Delete the review from the database
        await Review.findByIdAndDelete(reviewId);
        
        res.redirect(`/listings/${id}`);
    })
);

module.exports = router;

const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError");
const { listingSchema, reviewSchema } = require("./schema");

// Check if user is logged in
function isLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be signed in!");
    return res.redirect("/login");
  }
  next();
}

// Save redirect URL after login
function savedRedirectUrl(req, res, next) {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    delete req.session.redirectUrl;
  }
  next();
}

// Check if current user is the owner of the listing
async function isOwner(req, res, next) {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  // Fix: Add null check for listing.owner
  if (!listing.owner || !listing.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/listings/${id}`);
  }

  next();
}

// Validate listing data
function validateListing(req, res, next) {
  // ✅ FIX: Target the nested 'listing' object from the request body
  let { error } = listingSchema.validate(req.body.listing);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
}

// Validate review data
function validateReview(req, res, next) {
  // ✅ FIX: Target the nested 'review' object from the request body
  let { error } = reviewSchema.validate(req.body.review);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
}

module.exports = {
  isLoggedIn,
  savedRedirectUrl,
  isOwner,
  validateListing,
  validateReview,
};
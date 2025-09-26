const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { validateListing, isLoggedIn, isOwner } = require("../middleware");
const listingController = require("../controllers/listings");
const multer = require("multer");
const { storage } = require("../cloudconfig.js");

const upload = multer({storage});

// ======================
// Root route ("/listings")
// ======================
router.route("/")
  .get(wrapAsync(listingController.index))                    // GET /listings - Show all listings
  .post(isLoggedIn,upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing)); // POST /listings - Create new listing

// ======================
// NEW → Show form to create a listing
// GET /listings/new
// ======================
router.get("/new", isLoggedIn, wrapAsync(listingController.renderNewForm));

// ======================
// Individual listing routes ("/listings/:id")
// ======================
router.route("/:id")
  .get(wrapAsync(listingController.showListing))             
  .put(isLoggedIn, isOwner,upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))  // PUT /listings/:id - Update listing  
  .delete(isLoggedIn, wrapAsync(listingController.destroyListing));       // DELETE /listings/:id - Delete listing

// ======================
// EDIT → Show form to edit a listing
// GET /listings/:id/edit
// ======================
router.get("/:id/edit", isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;
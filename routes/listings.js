const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapasync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");

// Validation middleware
const validateListing = (req, res, next) => {
  let {err} = listingSchema.validate(req.body);
  if(err){
    let errMsg = err.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }else{
    next();
  }
}


// INDEX Route → Show all listings
router.get(
    "/",
    wrapAsync(async (req, res) => {
      const allListing = await Listing.find({});
      res.render("listings/index", { allListing });
    })
  );
  
  // NEW Route → Form to create a new listing
  router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
  });
  
  // SHOW Route → Show details of one listing by ID
  router.get(
    "/:id",
    wrapAsync(async (req, res) => {
      let { id } = req.params;
      const listing = await Listing.findById(id).populate("reviews");
      res.render("listings/show.ejs", { listing });
    })
  );

  // CREATE Route → Add new listing to DB
router.post(
  "/",
  validateListing,
  wrapAsync(async (req, res) => {
    if (!req.body.listing) {
      throw new ExpressError(400, "Send valid data for listing");
    }

    const newListing = new Listing(req.body.listing);
    let result = listingSchema.validate(req.body);
    console.log(result);
    await newListing.save();
    res.redirect("/listings");
  })
);

// EDIT Route → Form to edit an existing listing
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);

// UPDATE Route → Update listing in DB
router.put(
  "/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  })
);

// DELETE Route → Remove a listing
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  })
);


module.exports = router;

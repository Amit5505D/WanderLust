const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');  // Fixed import
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings, currentUser: req.user });
};

module.exports.renderNewForm = async (req, res) => {
  res.render("listings/new", { currentUser: req.user });
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
        select: "username"
      }
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  res.render("listings/show", { 
    listing, 
    currentUser: req.user,
    mapToken: process.env.MAP_TOKEN
  });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  let originalImage = listing.image.url;
  originalImage = originalImage.replace("/upload", "/upload/h_300,w_250");
  res.render("listings/edit", { listing, currentUser: req.user, originalImage });
};

module.exports.createListing = async (req, res) => {
  try {
    // Geocode the location
    let response = await geocodingClient.forwardGeocode({
      query: req.body.listing.location,
      limit: 1
    }).send();
    
    // Check if geocoding was successful
    if (!response.body.features || response.body.features.length === 0) {
      req.flash("error", "Invalid location. Please enter a valid location.");
      return res.redirect("/listings/new");
    }

    let url = req.file.path;
    let fileName = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, fileName };
    newListing.geometry = response.body.features[0].geometry;
    
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New listing created!");
    res.redirect("/listings");
  } catch (error) {
    console.error("Error creating listing:", error);
    req.flash("error", "Error creating listing. Please try again.");
    res.redirect("/listings/new");
  }
};

module.exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Update listing with new data
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }
    
    // Update image if new file uploaded
    if (typeof req.file !== 'undefined') { 
      let url = req.file.path;
      let fileName = req.file.filename;
      listing.image = { url, fileName };
    }
    
    // Update geometry if location changed
    if (req.body.listing.location) {
      let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      }).send();
      
      if (response.body.features && response.body.features.length > 0) {
        listing.geometry = response.body.features[0].geometry;
      }
    }
    
    await listing.save();
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
  } catch (error) {
    console.error("Error updating listing:", error);
    req.flash("error", "Error updating listing. Please try again.");
    res.redirect(`/listings/${id}/edit`);
  }
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndDelete(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listings");
};
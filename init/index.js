// index.js
const mongoose = require("mongoose");
const initData = require("./data.js"); // your sampleListings data
const Listing = require("../models/listing.js"); // your Listing schema

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// 1️⃣ Connect to MongoDB
mongoose.connect(MONGO_URL)
  .then(() => {
    console.log("Connected to DB");
    initDB(); // call the initDB function after connection
  })
  .catch((err) => {
    console.error("DB connection error:", err);
  });

// 2️⃣ Initialize the database
const initDB = async () => {
  try {
    await Listing.deleteMany({}); // remove old listings

    // Convert image object to URL string
    const transformedData = initData.data.map(item => ({
      ...item,
      image: item.image.url // only keep the URL
    }));

    await Listing.insertMany(transformedData); // insert new listings
    console.log("Data was initialized with URLs only");
  } catch (err) {
    console.error("Error initializing DB:", err);
  }
};

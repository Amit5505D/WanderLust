const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listings = require("./routes/listings.js");
const reviews = require("./routes/review.js");

// ======================
// DB Connection
// ======================
main()
  .then(() => {
    console.log("Connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

// ======================
// View Engine Setup
// ======================
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// ======================
// ROUTES
// ======================

// Root Route
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// Use the listings routes
app.use("/listings", listings);

// Use the review routes  
app.use("/listings", reviews);


// ======================
// ERROR HANDLERS
// ======================

// 404 Route → For undefined routes
app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// ======================
// START SERVER
// ======================
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});



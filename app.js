if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

// ======================
// Models & Routes
// ======================
const User = require("./models/user.js");
const listingsRouter = require("./routes/listings.js");
const reviewsRouter = require("./routes/review.js");
const userRoutes = require("./routes/user.js");

// ======================
// Utils
// ======================
const ExpressError = require("./utils/ExpressError.js");

// ======================
// DB Connection
// ======================

const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL)
  .then(() => console.log("Connected to DB"))
  .catch(err => console.log(err));

// ======================
// View Engine Setup
// ======================
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ======================
// Middleware
// ======================
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ======================
// Session & Flash
// ======================

const store = MongoStore.create({
  mongoUrl: MONGO_URL,
  crypto: {
    secret: process.env.SECRET 
  },
  touchAfter: 24 * 3600 // time period in seconds
});

store.on("error", function(e){
  console.log("SESSION STORE ERROR", e);
});

app.use(session({
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { httpOnly: true, maxAge: 1000*60*60*24*30 }
}));
app.use(flash());



// Passport Setup

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ======================
// Flash & Current User Middleware
// ======================
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// ======================
// Routes
// ======================
app.get("/", (req, res) => res.redirect("/listings"));

// User routes
app.use("/", userRoutes);

// Listings routes
app.use("/listings", listingsRouter);

// Reviews routes (nested under listings)
app.use("/listings/:id/reviews", reviewsRouter);  // ✅ fixed

// ======================
// 404 & Error Handling
// ======================
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// ======================
// Start Server
// ======================
app.listen(8080, () => console.log("Server is listening on port 8080"));

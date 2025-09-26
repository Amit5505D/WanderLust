const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, savedRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users");

// ======================
// SIGNUP ROUTES
// ======================
router.route("/signup")
  .get(userController.renderSignupForm)                    // GET /signup - Show signup form
  .post(wrapAsync(userController.signup));                 // POST /signup - Handle signup

// ======================
// LOGIN ROUTES
// ======================
router.route("/login")
  .get(userController.renderLoginForm)                     // GET /login - Show login form
  .post(                                                   // POST /login - Handle login
    savedRedirectUrl,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login"
    }),
    userController.login
  );

// ======================
// LOGOUT ROUTE
// ======================
router.get("/logout", userController.logout);

module.exports = router;
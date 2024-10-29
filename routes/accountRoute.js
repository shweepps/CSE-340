// Needed Resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities"); // Error handler
const regValidate = require('../utilities/account-validation')


// Route to handle login view when "My Account" is clicked
router.get("/login", utilities.handleErrors(accountController.buildLogin));

//Route to handle registration view when Signup is clicked (UNIT 4 ACTIVITY)
router.get("/register", utilities.handleErrors(accountController.buildRegister));



//Route to handle register data from registration page
router.post('/register',
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount))


// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)


// Account management route with authentication check Activity 5
router.get(
  "/",
  utilities.checkAuth, // Middleware to verify login
  utilities.handleErrors(accountController.buildAccountManagement)
);



  
// Export the router for use in server.js
module.exports = router;

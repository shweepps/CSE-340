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

// Export the router for use in server.js
module.exports = router;
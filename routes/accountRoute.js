// Needed Resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities"); // Error handler
const regValidate = require('../utilities/account-validation')

const restrictedAccess = utilities.checkAdminOrEmployee;



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

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.redirect('/'); // Handle error, if needed
    }
    res.clearCookie('sessionId');
    res.clearCookie('jwt');
    res.redirect('/'); // Redirect to homepage or login page
  });
});



// Account management route with authentication check Activity 5
router.get(
  "/",
  utilities.checkAuth, // Middleware to verify login
  utilities.handleErrors(accountController.buildAccountManagement)
);

/***********************************
 * assignment 5 routes for updating
 *********************************** */

// Route to display the account update form
router.get("/update/:account_id", utilities.handleErrors(accountController.buildAccountUpdateView));

// Route to handle account information update
router.post(
  "/update/:account_id",
   // Server-side validation middleware for account update
  utilities.handleErrors(accountController.updateAccount)
);

// Route to handle password update
router.post(
  "/change-password",
  utilities.validatePassword, // Server-side validation middleware for password
  utilities.handleErrors(accountController.changePassword)
);


// Route to display the contact form
router.get("/contact", accountController.buildContactForm);

// Route to handle contact form submission
router.post("/contact", accountController.processContactForm);

// Route to display all messages in admin view
router.get("/admin/messages",restrictedAccess, accountController.viewMessages);



// Export the router for use in server.js
module.exports = router;

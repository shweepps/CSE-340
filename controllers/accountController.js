const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
*  activity / unit 3
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
   
    res.render("account/login", {
      title: "Login",
      nav,
    })
  }

/* ****************************************
*  Deliver registration view unit4 activity
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
 
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
*  unit 4 activity
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { 
    account_firstname,
    account_lastname, 
    account_email,
    account_password 
  } = req.body


  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }


  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )
  console.log(req.body);  // Log the incoming data

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}


/* ****************************************
 *  Process login request Activity 5
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      req.session.loggedin = true; // Set logged-in status in session
      req.session.account_firstname = accountData.account_firstname; // Assignment 5 passing the logged in name to navigator
      req.session.accountData = accountData; // Store account data in session
      req.session.user = accountData; // Update this line

      return res.redirect("/account/"); // Redirect to account management
    } else {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    throw new Error("Access Forbidden");
  }
}

/* ****************************************
*  Process account management view
* *************************************** */
async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav();
  
  // Render account management view if authenticated
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    notice: req.flash("notice"),
    loggedin: req.session.loggedin, // Pass logged-in status
    accountData: req.session.accountData, // Pass account data
  });
}



/*********************************************
 * Assignment 5 functions for update
 ******************************************** */


/* ****************************************
*  Display the account update view
*  Assignment 5
* *************************************** */
// Display the profile update form
async function buildProfileUpdate(req, res) {
  const nav = await utilities.getNav();

    // Check if user is logged in
    if (!req.session.user) {
      req.flash("notice", "You need to log in to update your profile.");
      return res.redirect("/account/login");
    }

  const { account_id, account_firstname, account_lastname, account_email } = req.session.user;
  res.render("account/updateProfile", {
    title: "Update Profile",
    nav,
    account: { account_id, account_firstname, account_lastname, account_email },
    loggedin: req.session.loggedin, // Pass logged-in status
    accountData: req.session.accountData, // Pass account data
    errors: null
  });
}

// Handle updating general account information
async function processUpdateAccountInfo(req, res) {
  const { account_id } = req.session.accountData;
  const { account_firstname, account_lastname, account_email } = req.body;
  try {
   const resultUpdate = await accountModel.updateAccountInfo(account_id, account_firstname, account_lastname, account_email);
   if(resultUpdate){
    
    // Update session data
    req.session.accountData.account_firstname = account_firstname;
    req.session.accountData.account_lastname = account_lastname;
    req.session.accountData.account_email = account_email;


    
    res.redirect("/account/"); // Redirect to the profile page or another route
    req.flash("notice", "Account information updated successfully.");
    
   }else{
    req.flash("notice",'failed')
    res.redirect("account")
   }
    
  } catch (error) {
    console.error("Error updating account information:", error);
    res.status(500).send("Error updating account information.");
  }
}

/* ****************************************
*  Process account information update
*  Assignment 5
* *************************************** */
async function updateAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email } = req.body;
  const account_id = req.session.account_id; // Retrieve account_id from session

    // Check if email already exists and isn't the user's current email
    const existingAccount = await accountModel.getAccountByEmail(account_email);
    if (existingAccount && existingAccount.account_id !== account_id) {
      req.flash("notice", "This email is already in use. Please use another email.");
      return res.status(400).render("account/management", {
        title: "Update Account",
        nav,
        errors: null,
        account_firstname,
        account_lastname,
        account_email,
      });
    }

    const updateResult = await accountModel.updateAccountInfo(
      account_id, 
      account_firstname, 
      account_lastname, 
      account_email);

        if (updateResult) {
          req.flash("notice", "Account information updated successfully.");
          
          // Update session data with new account info
          req.session.accountData.account_firstname = account_firstname;
          req.session.accountData.account_lastname = account_lastname;
          req.session.accountData.account_email = account_email;
                
          
          
          res.status(201).render("account/management", {
            title: "Account Management",
            nav,
            errors: null,
          });
        } else {
          req.flash("notice", "Sorry, the update failed.");
          return res.status(501).render("account/management", {
            title: "Account Management",
            nav,
            accountData: req.body,
            errors: ["Update failed due to a server error."]
          });
        }
      } 


/* ****************************************
*  Process password update
*  Assignment 5
* *************************************** */
// Handle updating the account password
async function processUpdatePassword(req, res) {
  const { account_id } = req.session.user;
  const { account_password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    await accountModel.updateAccountPassword(account_id, hashedPassword);
    res.redirect("/account/updateProfile");
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).send("Error updating password.");
  }
}


/*****************************************************************
 * functions for contact form and admin messages Final enhancement
 *****************************************************************/
// Controller for displaying the contact form
async function buildContactForm(req, res) {
  const nav = await utilities.getNav();
  res.render("account/contact", {
    title: "Contact Us",
    nav,
    errors: null
  });
}

// Controller for processing the contact form submission
async function processContactForm(req, res) {
  const { sender_name, sender_email, message_content } = req.body;
  try {
    await accountModel.saveMessage(sender_name, sender_email, message_content);
    req.flash("notice", 'Thank you, Expect to hear from us')
    res.redirect("/account/contact");
  } catch (error) {
    console.error("Error processing contact form:", error);
    res.status(500).send("Error submitting form.");
  }
}

// Controller to display messages in the admin view
async function viewMessages(req, res) {
  const nav = await utilities.getNav();
  try {
    const messages = await accountModel.getMessages();
    res.render("account/adminMessages", {
      title: "Admin Messages",
      nav,
      messages
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).send("Error loading messages.");
  }
}


module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, updateAccount,  buildContactForm, processContactForm, viewMessages,  buildProfileUpdate, processUpdateAccountInfo, processUpdatePassword  }
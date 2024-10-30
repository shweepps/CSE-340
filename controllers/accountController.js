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
async function buildAccountUpdateView(req, res) {
  const account_id = parseFloat(req.params.account_id);
  let nav = await utilities.getNav();
  const accountData = await accountModel.getAccountById(account_id);
  const userName = `${accountData.account_firstname}`

  try {
     res.render("account/update", {
      title: "Update Account of " + userName,
      nav,
      accountData :accountData,
      errors: null,
    });
  } catch (error) {
    req.flash("notice", "Error loading account update view.");
    res.status(500).render("account", {
      title: "Update Account",
      nav,
      errors: null,
      accountData : accountData,
    });
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


  
  try {
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
      } catch (error) {
    req.flash("notice", "Error updating account information.");
    res.status(500).render("account/management", {
      title: "Update Account",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    });
  }
}


// /* ****************************************
//  *  Process Account Information Update
//  * **************************************** */
// async function updateAccount(req, res) {
//   let nav = await utilities.getNav();
//   const { account_firstname, account_lastname, account_email } = req.body;
//   const account_id = req.session.account_id; // Retrieve account_id from session

//   // Validation messages
//   let errors = [];

//   // Server-side validation for each field
//   if (!account_firstname || account_firstname.length < 2) {
//     errors.push("First name is required and must be at least 2 characters.");
//   }
//   if (!account_lastname || account_lastname.length < 2) {
//     errors.push("Last name is required and must be at least 2 characters.");
//   }
//   if (!account_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account_email)) {
//     errors.push("A valid email address is required.");
//   }

//   // If there are validation errors, return the form with error messages
//   if (errors.length > 0) {
//     req.flash("notice", errors.join("<br>"));
//     return res.status(400).render(`account/update/${account_id}`, {
//       title: "Update Account",
//       nav,
//       accountData: req.body, // Keep entered data sticky
//       errors,
//     });
//   }

//   try {
//     // Check if the email already exists in another account
//     const existingAccount = await accountModel.getAccountByEmail(account_email);
//     if (existingAccount && existingAccount.account_id !== account_id) {
//       req.flash("notice", "This email is already in use. Please use another email.");
//       return res.status(400).render("account/update", {
//         title: "Update Account",
//         nav,
//         accountData: req.body,
//         errors: ["This email is already in use."],
//       });
//     }

//     // Perform the update operation
//     const updateResult = await accountModel.updateAccountInfo(account_id, account_firstname, account_lastname, account_email);

//     if (updateResult) {
//       req.flash("notice", "Account information updated successfully.");
//       return res.redirect("account");
//     } else {
//       req.flash("notice", "Sorry, the update failed.");
//       return res.status(501).render("account", {
//         title: "Update Account",
//         nav,
//         accountData: req.body,
//         errors: ["Update failed due to a server error."]
//       });
//     }
//   } catch (error) {
//     console.error("Error updating account information:", error);
//     req.flash("notice", "Error updating account information.");
//     return res.status(500).render("account/", {
//       title: "Update Account",
//       nav,
//       accountData: req.body,
//       errors: ["An unexpected error occurred. Please try again later."],
//     });
//   }
// }





















/* ****************************************
*  Process password update
*  Assignment 5
* *************************************** */
async function changePassword(req, res) {
  let nav = await utilities.getNav();
  const { password } = req.body;
  const account_id = req.session.account_id; // Retrieve account_id from session

  // Check if account_id is valid
  if (!account_id || isNaN(account_id)) {
    req.flash("notice", "Invalid account ID.");
    return res.status(400).redirect("/account/update");
  }

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    await accountModel.updateAccountPassword(account_id, hashedPassword);

    req.flash("notice", "Password updated successfully.");
    res.redirect("/account/management");
  } catch (error) {
    req.flash("notice", "Error updating password.");
    res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
    });
  }
}











module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildAccountUpdateView, updateAccount, changePassword  }
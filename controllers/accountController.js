const utilities = require("../utilities/")
const accountModel = require("../models/account-model")


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
  req.flash("error","This will flash in register")
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

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
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

module.exports = { buildLogin, buildRegister, registerAccount }
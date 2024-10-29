const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  console.log(data.rows)
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
 * Build the classification view HTML
 ************************************** */
Util.buildClassificationGrid = async function(data) {
  let grid
  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => {
      grid += '<li>'
      grid += '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model 
      + ' details"><img src="' + vehicle.inv_thumbnail 
      + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model 
      + ' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)




/***************************************
 * Middleware to check token validity
 * unit 5, Login Process activity
 ************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET, function (err, accountData) {
      if (err) {
        req.flash("Please log in")
        res.clearCookie("jwt")
        return res.redirect("/account/login")
      }
      res.locals.accountData = accountData
      res.locals.loggedin = 1
      next()
    })
  } else {
    next()
  }
}

/***************************************************
 * Checks account type for administrative views only (Middleware)
 * task 2 in Assingment 5 
 **************************************************** */
Util.checkAdminOrEmployee = (req, res, next) => {
  const token = req.cookies.jwt;

  // Check if JWT exists
  if (!token) {
    req.flash("notice", "Access denied. Please log in as an employee or admin.");
    return res.redirect("/account/login");
  }

  try {
    // Verify JWT
    const accountData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Check if account type is "Employee" or "Admin"
    if (accountData.account_type === "Employee" || accountData.account_type === "Admin") {
      req.session.accountData = accountData; // Store verified data in session
      return next();
    } else {
      req.flash("notice", "Access denied. Only employees and admins can access this page.");
      return res.redirect("/account/login");
    }
  } catch (error) {
    req.flash("notice", "Session expired or invalid. Please log in.");
    return res.redirect("/account/login");
  }
};




/**************************
 * Build Vehicle view 
 * assignment 3
 ***************************/
Util.buildVehicleDetailHTML = (vehicleData) => {
  return `
    <h1>${vehicleData.inv_make} ${vehicleData.inv_model}</h1>
    <img src="${vehicleData.inv_image}" alt="${vehicleData.inv_make} ${vehicleData.inv_model}">
    <p>Price: $${new Intl.NumberFormat('en-US').format(vehicleData.inv_price)}</p>
    <p>Mileage: ${new Intl.NumberFormat('en-US').format(vehicleData.inv_miles)} miles</p>
    <p>${vehicleData.inv_description}</p>
    <p>Year: ${vehicleData.inv_year}</p>
    <p>Color: ${vehicleData.inv_color}</p>
  `;
};

/*********************************
 *  Build Classification Dropdown
 * Assignment 4
 ********************************** */

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList = '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (classification_id != null && row.classification_id == classification_id) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};





// //testing
Util.checkAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    req.flash("notice", "You must be logged in to access this page.");
    return res.redirect('/account/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    res.locals.accountData = decoded; // Pass account data to locals
    res.locals.loggedin = true;
    next();
  } catch (err) {
    res.clearCookie("jwt");
    res.clearCookie("sessionId");
    req.flash("notice", "Your session has expired. Please log in again.");
    return res.redirect('/account/login');
  }
};







module.exports = Util

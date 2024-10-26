/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()

const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const utilities = require("./utilities/index")
const inventoryRoute = require("./routes/inventoryRoute")
const session = require("express-session")
const pool = require('./database')
const accountRoute = require("./routes/accountRoute")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")

const app = express()

/*************************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

//unit 4 activity
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

//unit 5 Activity
app.use(cookieParser())
//Uniti5, Login Process activity
//app.use(utilities.checkJWTToken)


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static);

// Index route unit 3 activity
app.get("/", utilities.handleErrors(baseController.buildHome));

// Inventory routes
app.use("/inv", inventoryRoute);

//account route unit 4, activity
app.use("/account",accountRoute);

// File Not Found Route - must be last route in list
app.use((req, res, next) => {
  next({
    status: 404,
    message: `
      Sorry, we appear to have lost that page.
      <br>
      <img src="/images/site/th.jpeg" alt="Funny 404 Image">
    `
  });
});

/* ************************************
 * Express Error Handler
 * Place after all other middleware
 ***************************************/
app.use(async (err, req, res, next) => {
  const nav = await utilities.getNav(); // Fetch navigation
  console.error(`Error at "${req.originalUrl}": ${err.message}`);

  // Use the status from the error or default to 500
  const status = err.status || 500;

  // Determine if it's a 404 error (Not Found) or a server error
  const message = status === 404 ? err.message : 'Oh no! There was a crash. Maybe try a different route?';

  res.status(status).render("errors/error", {
    title: status === 404 ? '404 - Page Not Found' : 'Server Error',
    message,
    nav
  });
});

/* **********************************
 * Local Server Information
 * Values from .env (environment) file
 *************************************/
const port = process.env.PORT || 3000;  // Default port for safety
const host = process.env.HOST || 'localhost';  // Default host

/* *****************************************
 * Log statement to confirm server operation
 *******************************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});

// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities");//assingment 4


//Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

//Route to build inventory item detail view by vehicle ID assignment 3
router.get("/detail/:inv_id", invController.buildVehicleDetail);

//Router for management route Assignment 4 (redirect for '/inv/' to management)
router.get("/", utilities.handleErrors(invController.buildManagement));

// Route to display the add classification form Assignment 4
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));

// Route to handle form submission to add new classification Assignment 4
router.post("/add-classification", utilities.handleErrors(invController.addClassification));

// Route to display the add inventory form
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));

// Route to handle form submission for adding a new inventory item
router.post("/add-inventory", utilities.handleErrors(invController.addInventory));


router.get("/trigger-error", (req, res, next) => {
  const error = new Error("This is a custom-triggered error");
  error.status = 500; // Set the status to 500 to simulate a server error
  next(error); // Pass the error to the global error handler
});


module.exports = router;
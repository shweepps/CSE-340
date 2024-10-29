// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities");//assingment 4

// Middleware to restrict access to only employees and admins
const restrictedAccess = utilities.checkAdminOrEmployee;




//Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

//Route to build inventory item detail view by vehicle ID assignment 3
router.get("/detail/:inv_id", invController.buildVehicleDetail);

//Router for management route Assignment 4 (redirect for '/inv/' to management) now with restriction from assignment 5
router.get("/", restrictedAccess, utilities.handleErrors(invController.buildManagement));

// Route to display the add classification form Assignment 4
router.get("/add-classification", restrictedAccess, utilities.handleErrors(invController.buildAddClassification));

// Route to handle form submission to add new classification Assignment 4
router.post("/add-classification", restrictedAccess, utilities.handleErrors(invController.addClassification));

// Route to display the add inventory form
router.get("/add-inventory",restrictedAccess, utilities.handleErrors(invController.buildAddInventory));


// Route to handle form submission for adding a new inventory item
router.post("/add-inventory",restrictedAccess, utilities.handleErrors(invController.addInventory));


router.get("/trigger-error", (req, res, next) => {
  const error = new Error("This is a custom-triggered error");
  error.status = 500; // Set the status to 500 to simulate a server error
  next(error); // Pass the error to the global error handler
});

//Route on activity 5
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to display the edit inventory item view by inventory_id
router.get("/edit/:inv_id", restrictedAccess, utilities.handleErrors(invController.editInventoryView));

// Route to handle the incoming request for updating an inventory item with validation
router.post(
  "/edit-inventoryView", restrictedAccess, // Validate inventory data on update
  utilities.handleErrors(invController.updateInventory)
)

//Route to deliver delete confirmation view activity 5
router.post(
  "/delete", // Validate inventory data on update
  utilities.handleErrors(invController.deleteInventoryItem)

)

router.get("/delete/:inv_id", restrictedAccess, utilities.handleErrors(invController.deleteInventoryView));




module.exports = router;
// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

//Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

//Route to build inventory item detail view by vehicle ID assignment 3
router.get("/detail/:inv_id", invController.buildVehicleDetail);



router.get("/trigger-error", (req, res, next) => {
  const error = new Error("This is a custom-triggered error");
  error.status = 500; // Set the status to 500 to simulate a server error
  next(error); // Pass the error to the global error handler
});


module.exports = router;
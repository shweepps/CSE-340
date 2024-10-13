// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

//Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

//Route to build inventory item detail view by vehicle ID assignment 3
router.get("/detail/:inv_id", invController.buildVehicleDetail);



router.get("/trigger-error", (req, res, next) => {
    throw new Error("Intentional server error!");
  });
  

module.exports = router;
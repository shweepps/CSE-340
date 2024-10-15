const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}
 /*************************
 * Build vehicle detail view
 * assignment 3
 ************************** */
// invCont.buildVehicleDetail = async function (req, res, next) {
//   const inv_id = req.params.inv_id;
//   try {
//     const vehicleData = await invModel.getVehicleById(inv_id); // Fetch vehicle data
//     let nav = await utilities.getNav(); // Get the navigation bar
//     res.render("./inventory/detail", {
//       title: vehicleData.inv_make + " " + vehicleData.inv_model,
//       nav,
//       vehicle: vehicleData // Pass vehicle data to the view
//     });
//   } catch (error) {
//     next(error); // Pass the error to the error handler middleware
//   }
// };


invCont.buildVehicleDetail = async function (req, res, next) {
  const inv_id = req.params.inv_id;
  try {
    const vehicleData = await invModel.getVehicleById(inv_id); // Fetch vehicle data
    let nav = await utilities.getNav(); // Get the navigation bar

    // Format the price as USD with commas and currency symbol
    vehicleData.inv_price = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(vehicleData.inv_price);

    res.render("./inventory/detail", {
      title: vehicleData.inv_make + " " + vehicleData.inv_model,
      nav,
      vehicle: vehicleData // Pass vehicle data to the view
    });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
};



module.exports = invCont


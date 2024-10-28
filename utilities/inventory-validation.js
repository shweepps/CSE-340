const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model") // Import the inventory model
const utilities = require(".") // Import utilities for shared functions like getNav
const validate = {}

/* **********************************
 * Inventory Data Validation Rules for Adding Items
 * ********************************** */
validate.inventoryRules = () => {
  return [
    // classification_id is required
    body("classification_id")
      .isInt({ gt: 0 })
      .withMessage("Please select a valid classification."),

    // inv_make is required and must be a string
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Make is required."),

    // inv_model is required and must be a string
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Model is required."),

    // inv_year is required and must be a valid year
    body("inv_year")
      .isInt({ min: 1886, max: new Date().getFullYear() + 1 })
      .withMessage("Please provide a valid year."),

    // inv_description is required
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Description is required."),

    // inv_image is required
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Image URL is required."),

    // inv_thumbnail is required
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail URL is required."),

    // inv_price is required and must be a number greater than zero
    body("inv_price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than zero."),

    // inv_miles is required and must be a positive number
    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Miles must be a non-negative number."),

    // inv_color is required
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Color is required.")
  ]
}

/* ******************************
 * Check Inventory Data for Adding
 * ****************************** */
validate.checkInventoryData = async (req, res, next) => {
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add", {
      errors,
      title: "Add New Vehicle",
      nav,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    })
    return
  }
  next()
}

/* ******************************
 * Check Inventory Data for Updating
 * ****************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { inv_id, classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body
  let errors = validationResult(req)

  // Ensure inv_id exists in the database
  try {
    const inventoryItem = await invModel.getVehicleById(inv_id)
    if (!inventoryItem) {
      errors.errors.push({
        param: "inv_id",
        msg: "Invalid vehicle ID.",
      })
    }
  } catch (error) {
    console.error("Error checking inventory ID: ", error)
  }

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/edit", {
      errors,
      title: "Edit Vehicle",
      nav,
      inv_id,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    })
    return
  }
  next()
}

module.exports = validate

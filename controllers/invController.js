const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************************
 *  Build inventory by classification view
 * *************************************** */
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

/* ***************************
 * Deliver management view
 * Assignment 4
 *************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
    classificationSelect,
  });
};


/* ****************************************
 *  Deliver the add classification view
 * assignemnt 4
 **************************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList()
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
    classificationSelect,
  });
};

/* ****************************************
 *  Add new classification to the database
 * assignemnt 4
 **************************************** */
invCont.addClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList()
  const { classification_name } = req.body;

  // Server-side validation: check that classification_name is alphanumeric
  const regex = /^[a-zA-Z0-9]+$/;
  if (!regex.test(classification_name)) {
    req.flash("notice", "Classification name cannot contain spaces or special characters.");
    return res.status(400).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
    });
  }

  // Insert classification into the database
  const result = await invModel.addClassification(classification_name);
  
  if (result) {
    req.flash("notice", "Classification added successfully.");
    const updatedNav = await utilities.getNav(); // Update nav bar
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav: updatedNav,
      errors: null,
      classificationSelect,
    });
  } else {
    req.flash("error", "Failed to add classification.");
    res.status(500).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
    });
  }
};

/* ****************************************
 *  Deliver the add inventory view
 * Assignment 4
 **************************************** */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classificationSelect = await utilities.buildClassificationList();
  res.render("inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classificationSelect, // Dropdown options for classifications
    vehicleData: null, // No pre-existing data
    errors: null,
  });
};


/* ****************************************
 *  Add a new vehicle to the inventory
 * Assignment 4
 **************************************** */
invCont.addInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classificationSelect = await utilities.buildClassificationList();

  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body;

  // Validation messages
  let errors = [];

  // Server-side validation for each field
  if (!classification_id) errors.push("Classification is required.");
  if (!inv_make || inv_make.length < 2) errors.push("Make is required and must be at least 2 characters.");
  if (!inv_model || inv_model.length < 2) errors.push("Model is required and must be at least 2 characters.");
  if (!inv_year || !/^\d{4}$/.test(inv_year)) errors.push("Valid year is required (4 digits).");
  if (!inv_description || inv_description.length < 10) errors.push("Description is required and must be at least 10 characters.");
  if (!inv_image || !/^\/images\/.*/.test(inv_image)) errors.push("Valid image path is required (must start with '/images/').");
  if (!inv_thumbnail || !/^\/images\/.*/.test(inv_thumbnail)) errors.push("Valid thumbnail path is required (must start with '/images/').");
  if (!inv_price || inv_price <= 0) errors.push("Price is required and must be a positive number.");
  if (!inv_miles || inv_miles < 0) errors.push("Miles are required and must be a non-negative number.");
  if (!inv_color || inv_color.length < 3) errors.push("Color is required and must be at least 3 characters.");

  // If errors exist, return the form with error messages
  if (errors.length > 0) {
    req.flash("notice", errors.join("<br>"));
    return res.status(400).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationSelect,
      vehicleData: req.body, // Keep entered data sticky
      errors: null,
    });
  }

  // If no errors, proceed with adding the vehicle
  const result = await invModel.addInventoryItem(classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color);

  if (result) {
    req.flash("notice", "Vehicle added successfully.");
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      errors: null,
    });
  } else {
    req.flash("error", "Failed to add vehicle.");
    res.status(500).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationSelect,
      vehicleData: req.body, // Keep entered data sticky
      errors: null,
    });
  }
};


/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res) {
  let nav = await utilities.getNav();
  let classificationSelect = await utilities.buildClassificationList();

  const {
    classification_id,
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
  } = req.body;

  // Validation messages
  let errors = [];

  // Server-side validation for each field
  if (!classification_id) errors.push("Classification is required.");
  if (!inv_make || inv_make.length < 2) errors.push("Make is required and must be at least 2 characters.");
  if (!inv_model || inv_model.length < 2) errors.push("Model is required and must be at least 2 characters.");
  if (!inv_year || !/^\d{4}$/.test(inv_year)) errors.push("Valid year is required (4 digits).");
  if (!inv_description || inv_description.length < 10) errors.push("Description is required and must be at least 10 characters.");
  if (!inv_image || !/^\/images\/.*/.test(inv_image)) errors.push("Valid image path is required (must start with '/images/').");
  if (!inv_thumbnail || !/^\/images\/.*/.test(inv_thumbnail)) errors.push("Valid thumbnail path is required (must start with '/images/').");
  if (!inv_price || parseFloat(inv_price) <= 0) errors.push("Price is required and must be a positive number.");
  if (!inv_miles || parseInt(inv_miles) < 0) errors.push("Miles are required and must be a non-negative number.");
  if (!inv_color || inv_color.length < 3) errors.push("Color is required and must be at least 3 characters.");

  // If errors exist, return the form with error messages
  if (errors.length > 0) {
    req.flash("notice", errors.join("<br>"));
    return res.status(400).render("inventory/edit-inventoryView", {
      title: `Edit ${inv_make} ${inv_model}`,
      nav,
      classificationSelect,
      vehicleData: req.body, // Keep entered data sticky
      errors,
    });
  }

  // Perform the update operation
  const updateResult = await invModel.updateInventoryItem(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    parseFloat(inv_price),
    parseInt(inv_year),
    parseInt(inv_miles),
    inv_color,
    classification_id
  );

  if (updateResult) {
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("inventory/edit-inventoryView", {
      title: `Edit ${inv_make} ${inv_model}`,
      nav,
      classificationSelect,
      vehicleData: req.body, // Ensure data is retained if update fails
      errors: ["Update failed due to a server error."]
    });
  }
};


/* ****************************************
 *  Build edit inventory item view
 * activity 5
 **************************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getVehicleById(inv_id);
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

  res.render("inventory/edit-inventoryView", {
    title: "Edit " + itemName,
    nav,
    classificationSelect,
    errors: null,
    vehicleData: itemData,
   // Pass vehicle data here
  });
};

/* ****************************************
 *  Build delete inventory item view
 * activity 5
 **************************************** */
invCont.deleteInventoryView = async function (req, res, next){
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    vehicleData: itemData,
  })
}


/********************************************
 * Delete Inventory Item
 * Activity 5
 ******************************************** */
invCont.deleteInventoryItem = async function(req, res, next){
  let nav = await utilities.getNav()
  const inv_id =parseInt(req.body.inv_id)
  let classificationSelect = await utilities.buildClassificationList();

  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult){
    req.flash("notice", 'The deletion was successful.')
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      errors: null,
    });
  }else {
    req.flash("notice", "Sorry, the delete failed.");
    res.render("inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      vehicleData: req.body, // Ensure data is retained if update fails
      errors: ["Delete failed due to a server error."]
    });
  }
}




/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}




module.exports = invCont


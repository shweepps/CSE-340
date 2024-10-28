const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************** 
* Get vehicles
Assignmet 3
******************************* */

async function getVehicleById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    );
    return data.rows[0]; // Return the single vehicle data
  } catch (error) {
    console.error("Error fetching vehicle by ID: " + error);
    throw error;
  }
}

/* ****************************************
 *  Add new classification to the database
 **************************************** */
async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0];
  } catch (error) {
    console.error("Error adding classification: " + error);
    return null;
  }
}

/* ****************************************
 *  Add a new inventory item to the database
 **************************************** */
async function addInventoryItem(classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color) {
  try {
    const sql = `
      INSERT INTO inventory (classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
    const result = await pool.query(sql, [classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color]);
    return result.rows[0];
  } catch (error) {
    console.error("Error adding inventory item: " + error);
    return null;
  }
}

/* ****************************************
 *  Update inventory item to the database
 **************************************** */
async function updateInventoryItem(inv_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id) {
  try {
    const sql = `
      UPDATE inventory
      SET 
        inv_make = $1,
        inv_model = $2,
        inv_description = $3,
        inv_image = $4,
        inv_thumbnail = $5,
        inv_price = $6,
        inv_year = $7,
        inv_miles = $8,
        inv_color = $9,
        classification_id = $10
      WHERE inv_id = $11
      RETURNING *;
    `;
    const values = [inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id, inv_id];
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error updating inventory item:", error);
    throw error;
  }
}

/**************************************
 * Delete inventory item
 * activity 5
 *************************************** */
async function deleteInventoryItem(inv_id){
try{
  const sql =` DELETE FROM inventory WHERE  inv_id = $1`;
  const data = await pool.query(sql, [inv_id]);
  return data;
}catch (error){
  new Error("Delete Inventory Error")
}
}

module.exports = { getClassifications, getInventoryByClassificationId, getVehicleById, addClassification, addInventoryItem, updateInventoryItem, deleteInventoryItem };

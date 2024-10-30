const pool = require('../database/')

/* *****************************
*   Register new account
*   unit 4 activity
* ****************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
      return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
      return error.message
    }
  }

/* **************************
 *   Check for existing email
 * *************************** */
async function checkExistingEmail(account_email){
    try {
      const sql = "SELECT * FROM account WHERE account_email = $1"
      const email = await pool.query(sql, [account_email])
      return email.rowCount
    } catch (error) {
      return error.message
    }
  }


/* **************************************************
* Return account data using email address activity 5
* *************************************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}


/**************************************
 * assignment 5 model for update account
 ************************************** */



 
/* ****************************************
 *  Get account details by account ID
 **************************************** */
async function getAccountById(account_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.account WHERE account_id = $1`,
      [account_id]
    )
    return data.rows[0] // Return single account object
  } catch (error) {
    console.error("Error retrieving account by ID:", error)
    throw error // Throw error to handle it in your middleware
  }
}


// Update account information (first name, last name, and email) by account_id
async function updateAccountInfo(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = `
      UPDATE account
      SET 
        account_firstname = $1,
        account_lastname = $2,
        account_email = $3
      WHERE account_id = $4
      RETURNING *;`;
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id]);
    return result.rows[0];
    
  } catch (error) {
    console.error("Error details:", error);
    throw new Error("Error updating account information");
  }

  
}

// Update account password by account_id
async function updateAccountPassword(account_id, account_password) {
  try {
    const sql = `
      UPDATE account
      SET account_password = $1
      WHERE account_id = $2`;
    const result = await pool.query(sql, [account_password, account_id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error details:", error);
    throw new Error("Error updating password");
  }
}


// Function to save a new message
async function saveMessage(sender_name, sender_email, message_content) {
  try {
    const sql = `
      INSERT INTO messages (sender_name, sender_email, message_content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(sql, [sender_name, sender_email, message_content]);
    return result.rows[0];
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
}

// Function to retrieve all messages for the admin view
async function getMessages() {
  try {
    const sql = "SELECT * FROM messages ORDER BY created_at DESC";
    const result = await pool.query(sql);
    return result.rows;
  } catch (error) {
    console.error("Error retrieving messages:", error);
    throw error;
  }
}


/*********************************
 * 
 * Update account information
 */


// Update general account information (first name, last name, and email)
async function updateAccountInfo(account_id, account_firstName, account_lastName, account_email) {
  try {
    const sql = `
      UPDATE account
      SET account_firstname = $1, account_lastname = $2, account_email = $3
      WHERE account_id = $4
      RETURNING *
    `;
    const values = [account_firstName, account_lastName, account_email, account_id];
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error updating account info:", error);
    throw error;
  }
}

// Update account password
async function updateAccountPassword(account_id, hashedPassword) {
  try {
    const sql = `
      UPDATE account
      SET account_password = $1
      WHERE account_id = $2
      RETURNING *
    `;
    const result = await pool.query(sql, [hashedPassword, account_id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error updating account password:", error);
    throw error;
  }
}











module.exports = {registerAccount, checkExistingEmail, getAccountByEmail, getAccountById, updateAccountInfo, updateAccountPassword, saveMessage, getMessages, updateAccountInfo, updateAccountPassword};
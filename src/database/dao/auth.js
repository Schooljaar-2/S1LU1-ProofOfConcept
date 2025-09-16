import query from "../db.js";

// Generate query to check if e-mail / user exists in database for login
const authDao = {
  checkEmailAvailability: function (eMail, callback) {
    const sql = `
            select u.email, u.password_hash
            from user u 
            where u.email = ?
        `;
    // console.log(eMail)
    query(sql, [eMail], callback);
  },

  insertNewCustomerIntoDatabase: function (credentials, callback) {
    const username = credentials.username;
    const email = credentials.email;
    const password = credentials.password;
    const role = "CUSTOMER";

    const sql = `
        INSERT INTO user (username, email, password_hash, role)
        VALUES (?, ?, ?, ?);
        `;
    query(sql, [username, email, password, role], callback);
  },

  getUserIdAndRoleAndUsernameFromEmail: function (email, callback) {
    const sql = `
            select u.user_id, u.role, u.username
            from user u 
            where u.email = ?
        `;
    query(sql, [email], callback);
  },
};

export default authDao;

import query from "../db.js";

// Generate query to check if e-mail / user exists in database for login
const authDao = {
    checkEmailAvailability: function(eMail, callback){
        const sql = `
            select u.user_id 
            from user u 
            where u.email = ?
        `;
    // console.log(eMail)
    query(sql, [eMail], callback);
    }
}

export default authDao;
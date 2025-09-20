import query from "../../db.js";

const staffPersonalDao = {
    getStaffPersonalInfo: function(userId, callback){
    const sql = `
        SELECT s.first_name, 
               s.last_name, 
               s.active, 
               s.staff_id,
               a.address, 
               s.picture,
               a.postal_code, 
               a.district, 
               a.phone, 
               c1.city, 
               c2.country,
               u.username,
               u.email,
               st.store_name
        FROM user u
        JOIN staff s ON u.user_id = s.user_id
        JOIN address a ON s.address_id = a.address_id
        JOIN city c1 ON a.city_id = c1.city_id
        JOIN country c2 ON c1.country_id = c2.country_id
        JOIN store st ON s.store_id = st.store_id
        WHERE u.user_id = ?
    `;
    query(sql, [userId], callback);
    }
};

export default staffPersonalDao;
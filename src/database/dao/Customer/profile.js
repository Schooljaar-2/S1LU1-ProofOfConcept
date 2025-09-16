import query from "../../db.js";

const profileDao = {
  getAllCustomerPersonalInformationByUserId: function (userId, callback) {
    const sql = `
        select c.first_name, 
            c.last_name, 
            c.active,
            c.customer_id,
            a.address, 
            a.postal_code, 
            a.district, 
            a.phone, 
            c1.city, 
            c2.country,
            u.username,
            u.email
        from user u
        join customer c on u.user_id = c.user_id
        join address a on c.address_id = a.address_id 
        join city c1 on a.city_id = c1.city_id 
        join country c2 on c1.country_id = c2.country_id 
        where u.user_id = ?
        `;
    query(sql, [userId], callback);
  },
};

export default profileDao;

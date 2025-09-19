import query from "../../db.js";

const manageCustomerDao = {
    searchCustomers: function(searchTerm, active, offset, callback) {
    if (active !== 0 && active !== 1) active = null; // ignore filter if not 0 or 1

    const sql = `
        SELECT 
            c.customer_id,
            ANY_VALUE(c.user_id) AS user_id,
            ANY_VALUE(c.first_name) AS first_name,
            ANY_VALUE(c.last_name) AS last_name,
            ANY_VALUE(u.email) AS email,
            ANY_VALUE(c.active) AS active,
            ANY_VALUE(a.address) AS address,
            ANY_VALUE(a.postal_code) AS postal_code,
            ANY_VALUE(a.district) AS district,
            ANY_VALUE(ci.city) AS city,
            ANY_VALUE(co.country) AS country,
            ANY_VALUE(s.store_name) AS store_name
        FROM customer c
        JOIN user u ON c.user_id = u.user_id
        JOIN address a ON c.address_id = a.address_id
        JOIN city ci ON a.city_id = ci.city_id
        JOIN country co ON ci.country_id = co.country_id
        JOIN store s ON c.store_id = s.store_id
        WHERE (c.first_name LIKE CONCAT('%', ?, '%') 
               OR c.last_name LIKE CONCAT('%', ?, '%') 
               OR u.email LIKE CONCAT('%', ?, '%')
               OR ? IS NULL OR ? = '')
          AND (? IS NULL OR c.active = ?)
        GROUP BY c.customer_id
        ORDER BY ANY_VALUE(c.last_name) ASC, ANY_VALUE(c.first_name) ASC
        LIMIT 10 OFFSET ?;
    `;

    query(sql, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, active, active, offset], callback);
    },

    countCustomers: function(searchTerm, active, callback) {
    if (active !== 0 && active !== 1) active = null; // ignore filter if not 0 or 1

    const sql = `
        SELECT COUNT(*) AS total_customers
        FROM customer c
        JOIN user u ON c.user_id = u.user_id
        JOIN address a ON c.address_id = a.address_id
        JOIN city ci ON a.city_id = ci.city_id
        JOIN country co ON ci.country_id = co.country_id
        JOIN store s ON c.store_id = s.store_id
        WHERE (c.first_name LIKE CONCAT('%', ?, '%') 
               OR c.last_name LIKE CONCAT('%', ?, '%') 
               OR u.email LIKE CONCAT('%', ?, '%')
               OR ? IS NULL OR ? = '')
          AND (? IS NULL OR c.active = ?);
    `;

    query(sql, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, active, active], callback);
    }
};

export default manageCustomerDao;
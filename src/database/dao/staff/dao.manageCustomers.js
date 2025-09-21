import query from "../../db.js";

const manageCustomerDao = {
    searchCustomers: function(searchTerm, active, hasActive, offset, overdueFirst, callback) {
    if (active !== 0 && active !== 1) active = null; // ignore filter if not 0 or 1

    const sql = `
                SELECT 
            COALESCE(c.customer_id, NULL) AS customer_id,
            u.user_id,
            COALESCE(c.first_name, 'Profile') AS first_name,
            COALESCE(c.last_name, 'Not finished') AS last_name,
            u.email,
            COALESCE(c.active, 0) AS active,
            COALESCE(c.store_id, NULL) AS store_id,
            COALESCE(a.address, NULL) AS address,
            COALESCE(a.postal_code, NULL) AS postal_code,
            COALESCE(a.district, NULL) AS district,
            COALESCE(ci.city, NULL) AS city,
            COALESCE(co.country, NULL) AS country,
            COALESCE(s.store_name, NULL) AS store_name,
                        GROUP_CONCAT(i.film_id ORDER BY r.rental_date DESC SEPARATOR ',') AS active_film_ids,
                                    GROUP_CONCAT(
                            CASE 
                                WHEN r.rental_id IS NOT NULL 
                                    AND r.return_date IS NULL 
                                    AND NOW() > DATE_ADD(r.rental_date, INTERVAL f.rental_duration DAY)
                                THEN '1' ELSE '0' END
                            ORDER BY r.rental_date DESC SEPARATOR ','
                                    ) AS active_overdue_flags,
                                    MAX(
                                    CASE 
                                        WHEN r.rental_id IS NOT NULL 
                                            AND r.return_date IS NULL 
                                            AND NOW() > DATE_ADD(r.rental_date, INTERVAL f.rental_duration DAY)
                                        THEN 1 ELSE 0 END
                                ) AS has_overdue
        FROM user u
        LEFT JOIN customer c 
            ON c.user_id = u.user_id
        LEFT JOIN address a 
            ON c.address_id = a.address_id
        LEFT JOIN city ci 
            ON a.city_id = ci.city_id
        LEFT JOIN country co 
            ON ci.country_id = co.country_id
        LEFT JOIN store s 
            ON c.store_id = s.store_id
        LEFT JOIN rental r 
            ON c.customer_id = r.customer_id 
            AND r.return_date IS NULL -- only active rentals
        LEFT JOIN inventory i 
            ON r.inventory_id = i.inventory_id
        LEFT JOIN film f
            ON i.film_id = f.film_id
        WHERE u.role = 'CUSTOMER'
        AND (
            u.email LIKE CONCAT('%', ?, '%')
            OR c.first_name LIKE CONCAT('%', ?, '%') 
            OR c.last_name LIKE CONCAT('%', ?, '%') 
            OR ? IS NULL OR ? = ''
        )
    AND (? IS NULL OR c.active = ?)
    GROUP BY u.user_id
    ${hasActive ? "HAVING COUNT(r.rental_id) > 0" : ""}
        ORDER BY (CASE WHEN ? = 1 THEN has_overdue ELSE 0 END) DESC, first_name ASC, last_name ASC
        LIMIT 10 OFFSET ?;
    `;

    const overdueParam = (overdueFirst === 1) ? 1 : 0;
    query(sql, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, active, active, overdueParam, offset], callback);
    },
    countCustomers: function(searchTerm, active, hasActive, callback) {
        if (active !== 0 && active !== 1) active = null; // ignore filter if not 0 or 1

        const sql = `
            SELECT COUNT(DISTINCT u.user_id) AS total_customers
            FROM user u
            LEFT JOIN customer c ON c.user_id = u.user_id
            LEFT JOIN address a ON c.address_id = a.address_id
            LEFT JOIN city ci ON a.city_id = ci.city_id
            LEFT JOIN country co ON ci.country_id = co.country_id
            LEFT JOIN store s ON c.store_id = s.store_id
            LEFT JOIN rental r ON c.customer_id = r.customer_id AND r.return_date IS NULL
            WHERE u.role = 'CUSTOMER'
            AND (
                u.email LIKE CONCAT('%', ?, '%')
                OR c.first_name LIKE CONCAT('%', ?, '%')
                OR c.last_name LIKE CONCAT('%', ?, '%')
                OR ? IS NULL OR ? = ''
            )
            AND (? IS NULL OR COALESCE(c.active, 0) = ?)
            ${hasActive ? "AND r.rental_id IS NOT NULL" : ""}
        `;
        query(sql, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, active, active], callback);
    },
    selectCustomerById: function(customerId, callback){
        const sql = `
            select *
            from customer c
            join user u on c.user_id = u.user_id 
            where customer_id = ?
        `;
        query(sql, [customerId], callback);
    },
    updateCustomerActivity: function(active, customerId, callback){
        const sql = `
            UPDATE customer
            SET active = ?
            WHERE customer_id = ?;
        `;
        query(sql, [active, customerId], callback);
    },
    getUserCustomerId: function(userId, callback) {
        const sql = `
            SELECT c.customer_id
            FROM customer c
            WHERE c.user_id = ?
        `;
        query(sql, [userId], callback);
    },
    setCustomerUserIdToNull: function(customerId, callback){
        const sql = `
            UPDATE customer
            SET user_id = NULL
            WHERE customer_id = ?;
        `;
        query(sql, [customerId], callback);
    },
    deleteUser: function(userId, callback){
        const sql = `
            DELETE FROM user
            WHERE user_id = ?;
        `;
        query(sql ,userId, callback);
    },
};

export default manageCustomerDao;
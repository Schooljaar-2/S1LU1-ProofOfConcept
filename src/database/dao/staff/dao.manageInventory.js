import query from "../../db.js";

const inventoryDao = {
    getFilmInventoryInformationByMovieIdAndStoreId: function(movieId, storeId, callback) {
        const sql = `
            SELECT 
                i.inventory_id,
                s.store_name,
                i.retired,
                CASE 
                    WHEN r.rental_id IS NULL OR r.return_date IS NOT NULL 
                        THEN 'Available'
                    ELSE 'Rented'
                END AS status,
                r.rental_id,
                r.customer_id,
                u.email AS customer_email,
                CASE 
                    WHEN r.rental_id IS NOT NULL 
                        AND r.return_date IS NULL 
                        AND NOW() > DATE_ADD(r.rental_date, INTERVAL f.rental_duration DAY)
                        THEN 'Yes'
                    ELSE 'No'
                END AS overdue,
                f.rental_duration,
                f.rental_rate,
                f.replacement_cost
            FROM inventory i
            JOIN store s ON i.store_id = s.store_id
            JOIN film f ON i.film_id = f.film_id
            LEFT JOIN rental r 
                ON i.inventory_id = r.inventory_id
                AND r.rental_date = (
                    SELECT MAX(r2.rental_date)
                    FROM rental r2
                    WHERE r2.inventory_id = i.inventory_id
                )
            LEFT JOIN customer c ON r.customer_id = c.customer_id
            LEFT JOIN user u ON c.user_id = u.user_id
            WHERE i.film_id = ?
            AND i.store_id = ?
            ORDER BY i.inventory_id;
        `;
        query(sql, [movieId, storeId], callback);
    },
    getAllStores: function(callback){
        const sql = `
            select *
            from store
        `;
        query(sql, [], callback);
    },
    getMovieTitleAndYear: function(movieId, callback){
        const sql = `
            select f.title, f.release_year, f.film_id,
                   f.rental_duration, f.rental_rate, f.replacement_cost
            from film f
            where f.film_id = ?
        `;
        query(sql, [movieId], callback);
    },
    deleteInventoryById: function(inventoryId, callback){
        const sql = `
        
        `;
        query(sql, [inventoryId], callback);
    },
    updateRetireByInventoryId: function(inventoryId, retire, callback){
        const sql = `
            UPDATE inventory
            SET retired = ?
            WHERE inventory_id = ?;
        `;
        query(sql, [retire, inventoryId], callback);
    },
    createNewInventoryCopy: function(filmId, storeId, callback){
        const sql = `
            INSERT INTO inventory (film_id, store_id, last_update)
            VALUES (?, ?, NOW());
        `;
        query(sql, [filmId, storeId], callback);
    },
    returnRental: function(rentalId, callback) {
        const sql = `
            UPDATE rental
            SET return_date = NOW(),
                last_update = NOW()
            WHERE rental_id = ?
        `;
        query(sql, [rentalId], callback);
    },
    getStaffIdByUserId: function(userId, callback){
        const sql = `
            select s.staff_id
            from staff s
            where s.user_id = ?
        `;
        query(sql, [userId], callback);
    },
    createRental: function(inventoryId, customerId, staffId, callback) {
        const sql = `
            INSERT INTO rental (rental_date, inventory_id, customer_id, staff_id, last_update)
            VALUES (NOW(), ?, ?, ?, NOW())
        `;
        query(sql, [inventoryId, customerId, staffId], callback);
    },
    getRentalRateByInventoryId: function(inventoryId, callback) {
        const sql = `
            SELECT f.rental_rate
            FROM inventory i
            JOIN film f ON i.film_id = f.film_id
            WHERE i.inventory_id = ?
        `;
        query(sql, [inventoryId], callback);
    },
    createPayment: function(customerId, staffId, rentalId, amount, callback) {
        const sql = `
            INSERT INTO payment (customer_id, staff_id, rental_id, amount, payment_date, last_update)
            VALUES (?, ?, ?, ?, NOW(), NOW())
        `;
        query(sql, [customerId, staffId, rentalId, amount], callback);
    },
};

export default inventoryDao;
import query from "../../db.js";

const storeDashboardDao = {
  getStores: function(callback) {
    const sql = `SELECT store_id, store_name FROM store ORDER BY store_id`;
    query(sql, [], callback);
  },
  getStoreStats: function(storeId, callback) {
    const sql = `
      SELECT
        s.store_id,
        s.store_name,
        -- total customers assigned to store
        (SELECT COUNT(*) FROM customer c WHERE c.store_id = s.store_id) AS total_customers,
        -- total rentals attributed by inventory.store_id
        (SELECT COUNT(*)
         FROM rental r
         JOIN inventory i ON r.inventory_id = i.inventory_id
         WHERE i.store_id = s.store_id) AS total_rentals,
        -- total revenue (sum payments) attributed by inventory.store_id via rental
        (SELECT COALESCE(SUM(p.amount),0)
         FROM payment p
         JOIN rental r ON p.rental_id = r.rental_id
         JOIN inventory i ON r.inventory_id = i.inventory_id
         WHERE i.store_id = s.store_id) AS total_revenue,
        -- revenue last 7 days
        (SELECT COALESCE(SUM(p.amount),0)
         FROM payment p
         JOIN rental r ON p.rental_id = r.rental_id
         JOIN inventory i ON r.inventory_id = i.inventory_id
         WHERE i.store_id = s.store_id
           AND p.payment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) AS revenue_last_7d,
        -- revenue last 30 days
        (SELECT COALESCE(SUM(p.amount),0)
         FROM payment p
         JOIN rental r ON p.rental_id = r.rental_id
         JOIN inventory i ON r.inventory_id = i.inventory_id
         WHERE i.store_id = s.store_id
           AND p.payment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) AS revenue_last_30d,
        -- active rentals (not returned) currently by inventory.store_id
        (SELECT COUNT(*)
         FROM rental r2
         JOIN inventory i2 ON r2.inventory_id = i2.inventory_id
         WHERE i2.store_id = s.store_id
           AND r2.return_date IS NULL) AS active_rentals,
        -- overdue rentals currently by inventory.store_id
        (SELECT COUNT(*)
         FROM rental r3
         JOIN inventory i3 ON r3.inventory_id = i3.inventory_id
         JOIN film f ON i3.film_id = f.film_id
         WHERE i3.store_id = s.store_id
           AND r3.return_date IS NULL
           AND NOW() > DATE_ADD(r3.rental_date, INTERVAL f.rental_duration DAY)) AS overdue_rentals
      FROM store s
      WHERE s.store_id = ?
    `;
    query(sql, [storeId], callback);
  }
};

export default storeDashboardDao;

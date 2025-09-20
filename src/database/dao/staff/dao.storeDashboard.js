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
        -- total rentals at this store (via staff.store_id)
        (SELECT COUNT(*) FROM rental r JOIN staff st ON r.staff_id = st.staff_id WHERE st.store_id = s.store_id) AS total_rentals,
        -- total revenue (sum payments) at this store
        (SELECT COALESCE(SUM(p.amount),0) FROM payment p JOIN staff st2 ON p.staff_id = st2.staff_id WHERE st2.store_id = s.store_id) AS total_revenue,
        -- revenue last 7 days
        (SELECT COALESCE(SUM(p.amount),0) FROM payment p JOIN staff st3 ON p.staff_id = st3.staff_id WHERE st3.store_id = s.store_id AND p.payment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) AS revenue_last_7d,
        -- revenue last 30 days
        (SELECT COALESCE(SUM(p.amount),0) FROM payment p JOIN staff st4 ON p.staff_id = st4.staff_id WHERE st4.store_id = s.store_id AND p.payment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) AS revenue_last_30d,
        -- active rentals (not returned) currently
        (SELECT COUNT(*) FROM rental r2 JOIN staff st5 ON r2.staff_id = st5.staff_id WHERE st5.store_id = s.store_id AND r2.return_date IS NULL) AS active_rentals,
        -- overdue rentals currently
        (SELECT COUNT(*) FROM rental r3 JOIN staff st6 ON r3.staff_id = st6.staff_id JOIN inventory i ON r3.inventory_id = i.inventory_id JOIN film f ON i.film_id = f.film_id WHERE st6.store_id = s.store_id AND r3.return_date IS NULL AND NOW() > DATE_ADD(r3.rental_date, INTERVAL f.rental_duration DAY)) AS overdue_rentals
      FROM store s
      WHERE s.store_id = ?
    `;
    query(sql, [storeId], callback);
  }
};

export default storeDashboardDao;

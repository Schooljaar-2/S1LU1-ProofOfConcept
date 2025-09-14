import query from "../db.js";

export const getTop10Films = (callback) => {
  const sql = `
(
    SELECT 
        f.film_id,
        f.title,
        f.description,
        fi.image_url,
        COUNT(r.rental_id) AS rental_count,
        'last_7_days' AS source
    FROM film f
    JOIN film_image fi on f.film_id = fi.film_id
    JOIN inventory i ON f.film_id = i.film_id
    JOIN rental r ON i.inventory_id = r.inventory_id
    WHERE r.rental_date BETWEEN DATE_SUB(
            (SELECT MAX(r2.rental_date) FROM rental r2),
            INTERVAL 7 DAY
        )
        AND (SELECT MAX(r2.rental_date) FROM rental r2)
    GROUP BY f.film_id, f.title, f.description, fi.image_url 
    ORDER BY rental_count DESC
    LIMIT 6
)
UNION
(
    SELECT 
        f.film_id,
        f.title,
        fi.image_url,
        f.description,
        COUNT(r.rental_id) AS rental_count,
        'all_time' AS source
    FROM film f
    JOIN film_image fi on f.film_id = fi.film_id
    JOIN inventory i ON f.film_id = i.film_id
    JOIN rental r ON i.inventory_id = r.inventory_id
    GROUP BY f.film_id, f.title, f.description, fi.image_url 
    ORDER BY rental_count DESC
    LIMIT 6
)
LIMIT 6;
    `;
  query(sql, [], callback);
};

export const getMovieByID = (id, callback) => {
  const sql = `
  SELECT 
      f.title, 
      f.description,
      f.release_year,
      f.length,
      f.rating, 
      f.special_features, 
      f.rental_rate,
      f.replacement_cost,
      l.name AS language, 
      c.name AS category, 
      fi.image_url,
      GROUP_CONCAT(CONCAT(a.first_name, ' ', a.last_name) SEPARATOR ', ') AS actors
  FROM film f
  JOIN language l ON f.language_id = l.language_id 
  JOIN film_image fi ON f.film_id = fi.film_id 
  JOIN film_category fc ON f.film_id = fc.film_id 
  JOIN category c ON fc.category_id = c.category_id 
  JOIN film_actor fa ON f.film_id = fa.film_id
  JOIN actor a ON fa.actor_id = a.actor_id
  WHERE f.film_id = ?
  GROUP BY 
      f.film_id, f.title, f.description, f.release_year, f.length, 
      f.rating, f.special_features, f.rental_rate, f.replacement_cost, 
      l.name, c.name, fi.image_url;
  `;
  query(sql, [id], callback);
};

export const checkMovieAvailabilityAndTotalInventoryPerStoreByID = (
  id,
  callback
) => {
  const sql = `
  SELECT 
      s.store_name,
      COUNT(i.inventory_id) AS total_copies,
      SUM(CASE WHEN r.rental_id IS NULL THEN 1 ELSE 0 END) AS copies_available
  FROM inventory i
  JOIN store s ON i.store_id = s.store_id
  LEFT JOIN rental r 
      ON i.inventory_id = r.inventory_id 
      AND r.return_date IS NULL 
  WHERE i.film_id = ?
  GROUP BY s.store_name;
  `;
  query(sql, [id], callback);
};

export const getFilteredMovies = (title, rating, category, orderBy, callback) => {
  const sql = `
  select 
    ANY_VALUE(f.title) AS title,
    ANY_VALUE(f.release_year) AS release_year,
    f.film_id,
    ANY_VALUE(f.length) AS length,
    ANY_VALUE(fi.image_url) AS image_url,
    ANY_VALUE(f.rating) AS rating,
    GROUP_CONCAT(c.name SEPARATOR ', ') AS categories
  from film f
    join film_image fi on f.film_id = fi.film_id 
    join film_category fc on f.film_id = fc.film_id 
    join category c on fc.category_id = c.category_id 
  WHERE (f.title LIKE CONCAT('%', ?, '%') OR ? IS NULL OR ? = '')
    AND (f.rating  = ? OR '' IS null or ? = '')
    AND (c.name = ? OR ? IS null or ? = '')
  group by f.film_id
  order by ${(!orderBy || orderBy === "") ? "f.title asc" : orderBy}
  `;
  // console.log(sql);
  query(sql, [title, title, title, rating, rating, rating, category, category, category], callback);
};

// =======================================================================
// ===================== SEARCH BAR FILL FUNCTIONS =======================
// =======================================================================
//Querys to fill search bar of /movies page.
export const getAllMovieCategories = (callback) => {
  const sql = `
    select distinct c.name 
    from category c 
  `;
  query(sql, [], callback);
};

export const getAllMovieRatings = (callback) => {
  const sql = `
    select distinct f.rating
    from film f
  `;
  query(sql, [], callback);
};
// =======================================================================
// ===================== SEARCH BAR FILL FUNCTIONS =======================
// =======================================================================
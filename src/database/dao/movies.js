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
  select f.title, f.description, f.release_year, f.length, f.rating, f.special_features, l.name, c.name, fi.image_url 
  from film f 
  join language l on f.language_id  = l.language_id 
  join film_image fi on f.film_id = fi.film_id 
  join film_category fc on f.film_id = fc.film_id 
  join category c on fc.category_id = c.category_id 
  where f.film_id = ?
  `;
  query(sql, [id], callback);
};

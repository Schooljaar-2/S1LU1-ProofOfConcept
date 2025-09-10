import query from "../db.js";

export const getTop10Films = (callback) => {
  const sql = `
        select film.title, count(film.title) as rental_count
        from film
        join inventory on inventory.film_id = film.film_id
        join rental on rental.inventory_id = inventory.inventory_id
        group by film.title
        order by rental_count desc
        limit 10
    `;
  query(sql, [], callback);
};

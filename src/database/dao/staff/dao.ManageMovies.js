import query from "../../db.js";

const manageMoviesDao = {
    getAllActors: function(callback){
        const sql = `
            select * 
            from actor
            order by first_name asc, last_name asc
        `;
        query(sql, [], callback);
    },
    createNewMovie: function(title, description, release_year, language_id, original_language_id, rental_duration, rental_rate, length, replacement_cost, rating, special_features, callback) {
        if (original_language_id === '' || original_language_id === undefined) {
            original_language_id = null; // ✅ ensure proper NULL instead of empty string
        }
        const sql = `
            INSERT INTO film 
                (title, description, release_year, language_id, original_language_id, 
                rental_duration, rental_rate, length, replacement_cost, rating, special_features)
            VALUES 
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        query(sql, [title, description, release_year, language_id, original_language_id, rental_duration, rental_rate, length, replacement_cost, rating, special_features], callback);
    },
    coupleActorsToMovie: function(movieId, actors, callback) {
        // Build placeholders dynamically: "(?, ?), (?, ?), (?, ?)"
        const values = actors.map(() => '(?, ?)').join(', ');
        const sql = `
            INSERT INTO film_actor (actor_id, film_id)
            VALUES ${values}
        `;

        // Flatten params: [actor1, movieId, actor2, movieId, actor3, movieId...]
        const params = actors.flatMap(actorId => [actorId, movieId]);

        query(sql, params, callback);
    },
    coupleCategoriesToMovie: function(movieId, categories, callback) {
        // Build placeholders dynamically: "(?, ?), (?, ?), ..."
        const values = categories.map(() => '(?, ?)').join(', ');
        const sql = `
            INSERT INTO film_category (category_id, film_id)
            VALUES ${values}
        `;

        // Flatten params: [category1, movieId, category2, movieId, ...]
        const params = categories.flatMap(categoryId => [categoryId, movieId]);

        query(sql, params, callback);
    },
    coupleUrlToMovie: function(movieId, film_image_url, callback){
        if (film_image_url === '' || film_image_url === undefined) {
            film_image_url = null;
        }
        const sql = `
            insert into film_image (film_id, image_url)
            values (?, ?)
        `;
        query(sql, [movieId, film_image_url], callback);
    },
    getAllMovieInformationByMovieId: function(movieId, callback){
        const sql = `
            SELECT 
                f.title,
                f.description,
                f.release_year,
                f.language_id,
                f.original_language_id,
                f.rental_duration,
                f.rental_rate,
                f.length,
                f.replacement_cost,
                f.rating,
                f.special_features,
                fi.image_url AS film_image_url,
                GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') AS category,
                GROUP_CONCAT(DISTINCT CONCAT(a.first_name, ' ', a.last_name) SEPARATOR ', ') AS actors
            FROM film f
            LEFT JOIN film_image fi ON f.film_id = fi.film_id
            LEFT JOIN film_category fc ON f.film_id = fc.film_id
            LEFT JOIN category c ON fc.category_id = c.category_id
            LEFT JOIN film_actor fa ON f.film_id = fa.film_id
            LEFT JOIN actor a ON fa.actor_id = a.actor_id
            WHERE f.film_id = ?
            GROUP BY 
                f.film_id,
                f.title,
                f.description,
                f.release_year,
                f.language_id,
                f.original_language_id,
                f.rental_duration,
                f.rental_rate,
                f.length,
                f.replacement_cost,
                f.rating,
                f.special_features,
                fi.image_url;
            `;
            query(sql, [movieId], callback);
    },
};

export default manageMoviesDao;
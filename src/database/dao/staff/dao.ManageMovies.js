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
    updateMovie: function(movieId, title, description, release_year, language_id, original_language_id, rental_duration, rental_rate, length, replacement_cost, rating, special_features, callback) {
        if (original_language_id === '' || original_language_id === undefined) {
            original_language_id = null;
        }
        const sql = `
            UPDATE film SET
                title = ?,
                description = ?,
                release_year = ?,
                language_id = ?,
                original_language_id = ?,
                rental_duration = ?,
                rental_rate = ?,
                length = ?,
                replacement_cost = ?,
                rating = ?,
                special_features = ?
            WHERE film_id = ?
        `;
        query(sql, [title, description, release_year, language_id, original_language_id, rental_duration, rental_rate, length, replacement_cost, rating, special_features, movieId], callback);
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
    updateActorsForMovie: function(movieId, actors, callback) {
        const deleteSql = `DELETE FROM film_actor WHERE film_id = ?`;
        query(deleteSql, [movieId], (err) => {
            if (err) return callback(err);
            if (!actors.length) return callback(null);
            // Reuse coupleActorsToMovie to insert new relations
            manageMoviesDao.coupleActorsToMovie(movieId, actors, callback);
        });
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
    updateCategoriesForMovie: function(movieId, categories, callback) {
        const deleteSql = `DELETE FROM film_category WHERE film_id = ?`;
        query(deleteSql, [movieId], (err) => {
            if (err) return callback(err);
            if (!categories.length) return callback(null);
            manageMoviesDao.coupleCategoriesToMovie(movieId, categories, callback);
        });
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
    updateUrlForMovie: function(movieId, film_image_url, callback) {
        if (film_image_url === '' || film_image_url === undefined) {
            film_image_url = null;
        }
        // Try update first, if no row, insert
        const updateSql = `UPDATE film_image SET image_url = ? WHERE film_id = ?`;
        query(updateSql, [film_image_url, movieId], (err, result) => {
            if (err) return callback(err);
            if (result.affectedRows === 0) {
                // No row updated, insert new
                const insertSql = `INSERT INTO film_image (film_id, image_url) VALUES (?, ?)`;
                return query(insertSql, [movieId, film_image_url], callback);
            }
            callback(null);
        });
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
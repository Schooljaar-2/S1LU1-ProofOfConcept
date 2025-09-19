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
};

export default manageMoviesDao;
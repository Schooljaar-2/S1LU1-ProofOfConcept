import manageMoviesDao from "../../database/dao/staff/manageMovies.js"

export const createNewMovieService = (title, description, release_year, language_id, original_language_id, rental_duration, rental_rate, length, replacement_cost, rating, special_features, film_image_url, category, actors, callback) => {

    // Ensure category and actors are always arrays
    if (!Array.isArray(category)) category = category ? [category] : [];
    if (!Array.isArray(actors)) actors = actors ? [actors] : [];

    manageMoviesDao.createNewMovie(title, description, release_year, language_id, original_language_id, rental_duration, rental_rate, length, replacement_cost, rating, special_features, (err, response) => {
        if (err) {
            const error = {
                status: 500,
                message: "Internal Server Error (add new movie)",
                details: err
            };
            return callback(error, null);
        };
        // console.log(response);
        const newMovieId = response.insertId;
        // Next DAO funct --> couple the actors
        manageMoviesDao.coupleActorsToMovie(newMovieId, actors, (err, actorsResponse) => {
            if (err) {
                const error = {
                    status: 500,
                    message: "Internal Server Error (couple actors to new movie)",
                    details: err
                };
                return callback(error, null);
            };

            // Next Dao funct --> Couple movie categories
            manageMoviesDao.coupleCategoriesToMovie(newMovieId, category, (err, categoryResponse) => {
                if (err) {
                    const error = {
                        status: 500,
                        message: "Internal Server Error (couple categories to new movie)",
                        details: err
                    };
                    return callback(error, null);
                };

                //Next Dao funct --> if present, add url to new movie. 
                if(film_image_url){
                    manageMoviesDao.coupleUrlToMovie(newMovieId, film_image_url, (err, filmImageResponse) => {
                        if (err) {
                            const error = {
                                status: 500,
                                message: "Internal Server Error (couple categories to new movie)",
                                details: err
                            };
                            return callback(error, null);
                        };
                        // Success callback after all steps
                        return callback(null, {
                            status: 201,
                            message: "Movie created successfully",
                            movieId: newMovieId
                        });
                    });
                }
                else{
                    // Success callback after all steps (no image)
                    return callback(null, {
                        status: 201,
                        message: "Movie created successfully",
                        movieId: newMovieId
                    });
                }
            });
        });
    });
}
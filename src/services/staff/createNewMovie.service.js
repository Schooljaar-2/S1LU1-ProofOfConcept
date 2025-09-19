import manageMoviesDao from "../../database/dao/staff/dao.ManageMovies.js"

export const createNewMovieService = (
    title,
    description,
    release_year,
    language_id,
    original_language_id,
    rental_duration,
    rental_rate,
    length,
    replacement_cost,
    rating,
    special_features,
    film_image_url,
    category,
    actors,
    callback
) => {
    // Ensure category and actors are always arrays
    if (!Array.isArray(category)) category = category ? [category] : [];
    if (!Array.isArray(actors)) actors = actors ? [actors] : [];

    // Normalize special_features for DB (MySQL SET expects comma-separated string)
    let specialFeaturesValue = null;
    if (Array.isArray(special_features)) {
        specialFeaturesValue = special_features.join(',');
    } else if (typeof special_features === 'string' && special_features.trim() !== '') {
        specialFeaturesValue = special_features;
    } else {
        specialFeaturesValue = null;
    }

    manageMoviesDao.createNewMovie(
        title,
        description,
        release_year,
        language_id,
        original_language_id,
        rental_duration,
        rental_rate,
        length,
        replacement_cost,
        rating,
        specialFeaturesValue,
        (err, response) => {
            if (err) {
                const error = {
                    status: 500,
                    message: "Internal Server Error (add new movie)",
                    details: err
                };
                return callback(error, null);
            }
            const newMovieId = response.insertId;
            // Couple actors if provided
            const coupleActors = (next) => {
                if (!actors.length) return next();
                manageMoviesDao.coupleActorsToMovie(newMovieId, actors, (err) => {
                    if (err) {
                        const error = {
                            status: 500,
                            message: "Internal Server Error (couple actors to new movie)",
                            details: err
                        };
                        return callback(error, null);
                    }
                    next();
                });
            };

            // Couple categories if provided
            const coupleCategories = (next) => {
                if (!category.length) return next();
                manageMoviesDao.coupleCategoriesToMovie(newMovieId, category, (err) => {
                    if (err) {
                        const error = {
                            status: 500,
                            message: "Internal Server Error (couple categories to new movie)",
                            details: err
                        };
                        return callback(error, null);
                    }
                    next();
                });
            };

            // Couple url if present (DAO will coerce '' to null)
            const coupleUrl = () => {
                manageMoviesDao.coupleUrlToMovie(newMovieId, film_image_url, (err) => {
                    if (err) {
                        const error = {
                            status: 500,
                            message: "Internal Server Error (couple url to new movie)",
                            details: err
                        };
                        return callback(error, null);
                    }
                    return callback(null, {
                        status: 201,
                        message: "Movie created successfully",
                        movieId: newMovieId
                    });
                });
            };

            // Sequence: actors -> categories -> url -> done
            coupleActors(() => coupleCategories(() => coupleUrl()));
        }
    );
};
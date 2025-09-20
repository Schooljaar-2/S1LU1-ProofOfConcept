import manageMoviesDao from "../../database/dao/staff/dao.ManageMovies.js"

// Same as create movie, except update statements...
export const editMovieService = (
    movie_id,
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

    // Ensure category and actors are always arrays and deduplicated
    if (!Array.isArray(category)) category = category ? [category] : [];
    if (!Array.isArray(actors)) actors = actors ? [actors] : [];
    // Remove duplicates
    category = [...new Set(category)];
    actors = [...new Set(actors)];

    // Normalize special_features for DB (MySQL SET expects comma-separated string)
    let specialFeaturesValue = null;
    if (Array.isArray(special_features)) {
        specialFeaturesValue = special_features.join(',');
    } else if (typeof special_features === 'string' && special_features.trim() !== '') {
        specialFeaturesValue = special_features;
    } else {
        specialFeaturesValue = null;
    }

    manageMoviesDao.updateMovie(
        movie_id,
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
                    message: "Internal Server Error (update movie)",
                    details: err
                };
                return callback(error, null);
            }
            // Update actors if provided
            const updateActors = (next) => {
                manageMoviesDao.updateActorsForMovie(movie_id, actors, (err) => {
                    if (err) {
                        const error = {
                            status: 500,
                            message: "Internal Server Error (update actors for movie)",
                            details: err
                        };
                        return callback(error, null);
                    }
                    next();
                });
            };

            // Update categories if provided
            const updateCategories = (next) => {
                manageMoviesDao.updateCategoriesForMovie(movie_id, category, (err) => {
                    if (err) {
                        const error = {
                            status: 500,
                            message: "Internal Server Error (update categories for movie)",
                            details: err
                        };
                        return callback(error, null);
                    }
                    next();
                });
            };

            // Update url if present (DAO will coerce '' to null)
            const updateUrl = () => {
                manageMoviesDao.updateUrlForMovie(movie_id, film_image_url, (err) => {
                    if (err) {
                        const error = {
                            status: 500,
                            message: "Internal Server Error (update url for movie)",
                            details: err
                        };
                        return callback(error, null);
                    }
                    return callback(null, {
                        status: 200,
                        message: "Movie updated successfully",
                        movieId: movie_id
                    });
                });
            };

            // Sequence: actors -> categories -> url -> done
            updateActors(() => updateCategories(() => updateUrl()));
        }
    );
};

import {
  getMovieByID,
  checkMovieAvailabilityAndTotalInventoryPerStoreByID,
  getAllMovieCategories,
  getAllMovieRatings,
} from "../database/dao/movies.js";

export function moviePage(req, res, next) {
  const movieID = req.params.movieID;

  getMovieByID(movieID, (error, movie) => {
    if (error) return next(error);
    if (!movie || movie.length === 0) {
      const err = new Error("Movie not found");
      err.status = 404;
      return next(err);
    }

    checkMovieAvailabilityAndTotalInventoryPerStoreByID(
      movieID,
      (error2, availability) => {
        if (error2) return next(error2);
        // If no availability, pass empty array and handle in view
        if (!availability || availability.length === 0) {
          availability = [];
        }
        function toPascalCase(str) {
          return str
            .split(",")
            .map((name) =>
              name
                .trim()
                .split(" ")
                .map(
                  (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join(" ")
            )
            .join(", ");
        }

        // Clone movie object before mutating
        const movieData = { ...movie[0] };
        if (movieData.actors) {
          movieData.actors = toPascalCase(movieData.actors);
        }

        res.render("./customer/moviePage.hbs", {
          movie: movieData,
          availability,
        });
      }
    );
  });
}

export function movies(req, res, next) {
  getAllMovieCategories((error, categories) => {
    if (error) return next(error);
    getAllMovieRatings((error2, ratings) => {
      if (error2) return next(error2);
      res.render("./customer/movies.hbs", { categories, ratings });
    });
  });
}

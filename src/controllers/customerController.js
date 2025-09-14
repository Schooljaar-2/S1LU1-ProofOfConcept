import {
  getMovieByID,
  checkMovieAvailabilityAndTotalInventoryPerStoreByID,
  getAllMovieCategories,
  getAllMovieRatings,
  getFilteredMovies,
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

  const orderOptions = [
    "f.title ASC",
    "f.title DESC",
    "f.release_year ASC",
    "f.release_year DESC",
    "f.rental_rate ASC",
    "f.rental_rate DESC",
    "f.length ASC",
    "f.length DESC"
  ];

  // Read all filter params from query, default to empty string
  const title = req.query.title || "";
  const rating = req.query.rating || "";
  const category = req.query.category || "";
  const orderBy = req.query.orderBy || "";

  // Select order option by index, default to index 1 if out of bounds
  let orderIndex = parseInt(orderBy, 10);
  if (isNaN(orderIndex) || orderIndex < 0 || orderIndex >= orderOptions.length) {
    orderIndex = 1;
  }
  const selectedOrderBy = orderOptions[orderIndex];

  getAllMovieCategories((error, categories) => {
    if (error) {
      error.status = 500;
      return next(error);
    }
    getAllMovieRatings((error2, ratings) => {
      if (error2) {
        error2.status = 500;
        return next(error2);
      }
      getFilteredMovies(title, rating, category, orderBy, (error3, movies) => {
        if (error3) {
          error3.status = 500;
          return next(error3);
        }
        console.log(movies);
        res.render("./customer/movies.hbs", { categories, ratings, movies });
      });
    });
  });
}

import {
  getMovieByID,
  checkMovieAvailabilityAndTotalInventoryPerStoreByID,
} from "../database/dao/movies.js";

export function movies(req, res) {
  res.render("./customer/movies.hbs");
}

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
        if (!availability || availability.length === 0) {
          const err = new Error("Movie not found");
          err.status = 404;
          return next(err);
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

        if (movie[0].actors) {
          movie[0].actors = toPascalCase(movie[0].actors);
        }

        res.render("./customer/moviePage.hbs", {
          movie: movie[0],
          availability,
        });
      }
    );
  });
}

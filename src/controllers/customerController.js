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

        // Debug log for movieID and title
        console.log(
          `Rendering movie page for ID: ${movieID}, Title: ${movieData.title}`
        );

        res.render("./customer/moviePage.hbs", {
          movie: movieData,
          availability,
        });
      }
    );
  });
}

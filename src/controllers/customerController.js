import { getMovieByID } from "../database/dao/movies.js";

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
    res.render("./customer/moviePage.hbs", { movie: movie[0] });
  });
}

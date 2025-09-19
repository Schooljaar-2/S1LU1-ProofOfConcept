import manageMoviesDao from "../database/dao/staff/dao.ManageMovies.js"
import staffPersonalDao from "../database/dao/staff/dao.staffPersonalInfo.js"
import {
  getAllMovieCategories,
  getAllMovieRatings,
  getFilteredMovies,
  getFilteredMoviesCount,
} from "../database/dao/customer/movies.js";

import {checkAuthorisation} from "../services/auth.service.js"
import {createNewMovieService} from "../services/staff/createNewMovie.service.js"

export function staffPage(req, res, next){
    if (!checkAuthorisation(req, "STAFF")) {
        res.redirect("/login");
        return;
    }
    const userId = req.session.user_id;

    staffPersonalDao.getStaffPersonalInfo(userId, (err, info) => {
        if (err) {
            err.status = 500;
            return next(err);
        }
        console.log(info);
        res.render("./staff/staffPersonalInfo.hbs", { info: info[0] });
    });
}

export function dashboard(req, res, next){
    if (!checkAuthorisation(req, "STAFF")) {
        res.redirect("/login");
        return;
    }

    res.render("./staff/dashboard.hbs");
}

export function manageOrCreateMovies(req, res, next){
    if (!checkAuthorisation(req, "STAFF")) {
        res.redirect("/login");
        return;
    }
    res.render("./staff/manageMovies/manageOrCreateMovies.hbs");
}

export function createNewMovie(req, res, next){
    if (!checkAuthorisation(req, "STAFF")) {
        res.redirect("/login");
        return;
    }
    manageMoviesDao.getAllActors((err, actors) => {
        if (err) {
        err.status = 500;
        return next(err);
        }
        res.render("./staff/manageMovies/createNewMovie.hbs", {actors});
    });
}

export function handlePostCreateNewMovie(req, res, next){
    if (!checkAuthorisation(req, "STAFF")) {
        res.redirect("/login");
        return;
    }
    // console.log(req.body);
    const title = req.body.title;
    const description = req.body.description;
    const film_image_url = req.body.film_image_url;
    const category = req.body.category;
    const actors = req.body.actors;
    const release_year = req.body.release_year;
    const language_id = req.body.language_id;
    const original_language_id = req.body.original_language_id;
    const rental_duration = req.body.rental_duration;
    const rental_rate = req.body.rental_rate;
    const length = req.body.length;
    const replacement_cost = req.body.replacement_cost;
    const rating = req.body.rating;
    const special_features = req.body.special_features;

    createNewMovieService(title, description, release_year, language_id, original_language_id, rental_duration, rental_rate, length, replacement_cost, rating, special_features, film_image_url, category, actors, (err, response) => {
        if(err){
            manageMoviesDao.getAllActors((actorsErr, actors) => {
                if (actorsErr) {
                    actorsErr.status = 500;
                    return next(actorsErr);
                }
                console.log(err);
                res.render("./staff/manageMovies/createNewMovie.hbs", {actors, oldValues: req.body, err: err.message || err});
            });
            return;
        }
        const newInsertedMovieId = response.movieId;
        res.redirect(`/movies/${newInsertedMovieId}`);
    });
}

export function manageMovies(req, res, next){
    if (!checkAuthorisation(req, "STAFF")) {
        res.redirect("/login");
        return;
    }

    const orderOptions = [
        "f.title ASC",
        "f.title DESC",
        "f.release_year ASC",
        "f.release_year DESC",
        "f.rental_rate ASC",
        "f.rental_rate DESC",
        "f.length ASC",
        "f.length DESC",
      ];
    
      // Read all filter params from query, default to empty string
      const title = req.query.title || "";
      const rating = req.query.rating || "";
      const category = req.query.category || "";
      const orderBy = req.query.sort || "";
      var pagination = parseInt(req.query.pagination, 0);
    
      if (isNaN(pagination) || pagination < 0) pagination = 0;
    
      // console.log(pagination)
    
      // Select order option by index, default to index 1 if out of bounds
      let orderIndex = parseInt(orderBy, 10);
      if (
        isNaN(orderIndex) ||
        orderIndex < 0 ||
        orderIndex >= orderOptions.length
      ) {
        orderIndex = 0;
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
          getFilteredMoviesCount(title, rating, category, (error3, count) => {
            if (error3) {
              error3.status = 500;
              return next(error3);
            }
            const amount = count[0].total_count;
            // console.log(amount);
            const maxPage = Math.floor(amount / 10);
            if (pagination > maxPage) pagination = maxPage;
    
            getFilteredMovies(
              title,
              rating,
              category,
              pagination,
              selectedOrderBy,
              (error4, movies) => {
                if (error4) {
                  error4.status = 500;
                  return next(error4);
                }
                console.log(movies);
                res.render("./staff/manageMovies/manageMoviesSearch.hbs", {
                  categories,
                  ratings,
                  movies,
                  totalCount: amount,
                  filters: {
                    title,
                    rating,
                    category,
                    sort: orderBy,
                    pagination,
                  },
                });
              }
            );
          });
        });
      });
}

export function editMovies(req, res, next){
  const movieID = req.params.movieID;

  manageMoviesDao.getAllMovieInformationByMovieId(movieID, (err, movieInformation) => {
    if (err) {
        err.status = 500;
        return next(err);
    }
    manageMoviesDao.getAllActors((err, actors) => {
      if (err) {
          err.status = 500;
          return next(err);
      }
      // Convert actor names to IDs for oldValues.actors
      const actorNameToId = {};
      actors.forEach(a => {
        actorNameToId[`${a.first_name} ${a.last_name}`.toUpperCase()] = a.actor_id;
      });
      let oldValues = { ...movieInformation[0] };
      if (oldValues.actors && typeof oldValues.actors === 'string') {
        oldValues.actors = oldValues.actors.split(',').map(name => name.trim().toUpperCase()).map(name => actorNameToId[name]).filter(Boolean);
      }
      res.render("./staff/manageMovies/updateMovie.hbs", {oldValues, actors});
    });
  });
}

export function manageInventories(req, res, next){
  const movieID = req.params.movieID;

}
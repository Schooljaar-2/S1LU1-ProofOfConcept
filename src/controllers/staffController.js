import manageMoviesDao from "../database/dao/staff/dao.ManageMovies.js"
import staffPersonalDao from "../database/dao/staff/dao.staffPersonalInfo.js"

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

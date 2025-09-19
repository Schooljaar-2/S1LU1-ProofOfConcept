import manageMoviesDao from "../database/dao/staff/manageMovies.js"

import {checkAuthorisation} from "../services/auth.service.js"

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

        console.log(actors);
        res.render("./staff/manageMovies/createNewMovie.hbs", {actors});
    });
}

export function handleCreateNewMovie(req, res, next){
    if (!checkAuthorisation(req, "STAFF")) {
        res.redirect("/login");
        return;
    }
    console.log(req.body);
    res.redirect("/movies");
}
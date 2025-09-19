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
    res.render("./staff/manageMovies/createNewMovie.hbs");
}
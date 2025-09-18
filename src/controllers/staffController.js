import inventoryDao from "../database/dao/staff/inventory.js"

import {checkAuthorisation} from "../services/auth.service.js"

export function dashboard(req, res, next){
    if (!checkAuthorisation(req, "STAFF")) {
        res.redirect("/login");
        return;
    }

    res.render("./staff/dashboard.hbs");
}
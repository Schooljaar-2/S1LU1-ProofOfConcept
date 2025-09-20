import manageMoviesDao from "../database/dao/staff/dao.ManageMovies.js"
import staffPersonalDao from "../database/dao/staff/dao.staffPersonalInfo.js"
import inventoryDao from "../database/dao/staff/dao.manageInventory.js";
import {
  getAllMovieCategories,
  getAllMovieRatings,
  getFilteredMovies,
  getFilteredMoviesCount,
} from "../database/dao/customer/movies.js";

import {checkAuthorisation} from "../services/auth.service.js"
import {createNewMovieService} from "../services/staff/createNewMovie.service.js"
import getInventoryInformationPerStore from "../services/staff/inventoryPerStore.service.js";
import {editMovieService} from "../services/staff/editMovie.service.js"
import {toggleRetireByInventoryId} from "../services/staff/retireInventoryById.service.js"
import {findCustomerByFirstLastOrEmail} from "../services/staff/customerSearch.service.js"
import {toggleCustomerActivityService} from "../services/staff/toggleCustomerActive.service.js"
import {deleteCustomerService} from "../services/staff/deleteCustomer.service.js"
import {makeNewRentalService} from "../services/staff/makeNewRental.service.js"
import storeDashboardDao from "../database/dao/staff/dao.storeDashboard.js";

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
        // console.log(info);
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
                // console.log(err);
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
                // console.log(movies);
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
    if (!checkAuthorisation(req, "STAFF")) {
        res.redirect("/login");
        return;
    }

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
      // Normalize special_features to array for checkbox binding
      if (oldValues.special_features && typeof oldValues.special_features === 'string') {
        oldValues.special_features = oldValues.special_features.split(',').map(f => f.trim());
      }
      // Normalize category to array of IDs for multi-select dropdown
      const categoryNameToId = {
        'ACTION': 1, 'ANIMATION': 2, 'CHILDREN': 3, 'CLASSICS': 4, 'COMEDY': 5,
        'DOCUMENTARY': 6, 'DRAMA': 7, 'FAMILY': 8, 'FOREIGN': 9, 'GAMES': 10,
        'HORROR': 11, 'MUSIC': 12, 'NEW': 13, 'SCI-FI': 14, 'SPORTS': 15, 'TRAVEL': 16
      };
      if (oldValues.category && typeof oldValues.category === 'string') {
        oldValues.category = oldValues.category.split(',')
          .map(cat => cat.trim().toUpperCase())
          .map(cat => categoryNameToId[cat])
          .filter(Boolean);
      }
      // console.log(oldValues);
      res.render("./staff/manageMovies/updateMovie.hbs", {oldValues, actors, movieID});
    });
  });
}

export function handlePostEditMovie(req, res, next){
  if (!checkAuthorisation(req, "STAFF")) {
    res.redirect("/login");
    return;
  }
  // Import all vars from req.body
  const movie_id = req.body.movie_id;
  const title = req.body.title;
  const description = req.body.description;
  const film_image_url = req.body.film_image_url;
  let category = req.body.category;
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

  // Normalize category to array of IDs if needed
  getAllMovieCategories((catErr, categories) => {
    if (catErr) {
      catErr.status = 500;
      return next(catErr);
    }
    const categoryNameToId = {};
    categories.forEach(c => {
      categoryNameToId[c.name.toUpperCase()] = c.category_id;
    });
    // If category is a string of names, convert to array of IDs
    if (typeof category === 'string' && category.includes(',')) {
      category = category.split(',').map(name => name.trim().toUpperCase()).map(name => categoryNameToId[name]).filter(Boolean);
    }
    // If category is a single name, convert to ID
    else if (typeof category === 'string' && isNaN(category)) {
      const id = categoryNameToId[category.trim().toUpperCase()];
      category = id ? [id] : [];
    }
    // If category is a single ID string, make it an array
    else if (typeof category === 'string') {
      category = [category];
    }
    // If already array, check if names or IDs
    else if (Array.isArray(category)) {
      category = category.map(val => {
        if (!isNaN(val)) return val;
        return categoryNameToId[val.trim().toUpperCase()] || null;
      }).filter(Boolean);
    }

    // console.log(category);
    editMovieService(
      movie_id,
      title,
      description,
      release_year,
      language_id,
      original_language_id,
      rental_duration,
      rental_rate,
      length,
      replacement_cost,
      rating,
      special_features,
      film_image_url,
      category,
      actors,
      (err, response) => {
        if(err){
          manageMoviesDao.getAllActors((actorsErr, actors) => {
            if (actorsErr) {
              actorsErr.status = 500;
              return next(actorsErr);
            }
            // console.log(err);
            res.render("./staff/manageMovies/updateMovie.hbs", {actors, oldValues: req.body, err: err.message || err});
          });
          return;
        }
        res.redirect(`/movies/${movie_id}`);
      }
    );
  });
}

export function manageInventories(req, res, next) {
  if (!checkAuthorisation(req, "STAFF")) {
    res.redirect("/login");
    return;
  }

  const movieID = req.params.movieID;
  const storeId = req.query.storeId;
  // console.log(storeId);

  getInventoryInformationPerStore(storeId, movieID, (err, result) => {
    if (err) {
      err.status = err.status || 500;
      return next(err);
    }
    // console.log(result);
    const { stores, inventoryStore, movieInfo } = result;
    const mi = (Array.isArray(movieInfo) ? movieInfo[0] : movieInfo) || {};
    const rentalDuration = mi.rental_duration ?? mi.rentalDuration ?? null;
    const rentalRate = mi.rental_rate ?? mi.rentalRate ?? null;
    const replacementCost = mi.replacement_cost ?? mi.replacementCost ?? null;


    const selectedStoreNormalized = storeId || 1;
    res.render("./staff/manageMovies/manageInventory.hbs", {
      stores,
      selectedStore: selectedStoreNormalized,
      inventoryInformation: inventoryStore || [],
      movieInfo: mi,
      rentalDuration,
      rentalRate,
      replacementCost
    });
  });
}

export function handlePostRetireInventoryId(req, res, next) {
  if (!checkAuthorisation(req, "STAFF")) {
    res.redirect("/login");
    return;
  }

  const inventoryId = req.body.inventoryId;
  const retire = parseInt(req.body.retire, 10);
  const movieId = req.body.movieId;
  const storeId = req.body.storeId;

  toggleRetireByInventoryId(inventoryId, retire, (err, retireSuccess) => {
    if (err) {
      err.status = err.status || 500;
      return next(err);
    }
    res.redirect(`/dashboard/manageOrCreateMovies/manage/inventory/${movieId}?storeId=${storeId}`);
  });
}

export function manageCustomers(req, res, next){
  if (!checkAuthorisation(req, "STAFF")) {
    res.redirect("/login");
    return;
  }
  
  // Setting params for customer search service. 
  const searchterm = req.query.search || "";
  let isActive = parseInt(req.query.active, 10);
  if (isNaN(isActive)) isActive = "";
  // 'offset' in query is treated as row offset (0, 10, 20, ...)
  let rowOffset = parseInt(req.query.offset, 10);
  if (isNaN(rowOffset)) rowOffset = 0;
  // Service expects page index and multiplies by 10 internally
  const pageIndex = Math.floor(rowOffset / 10);
  
  findCustomerByFirstLastOrEmail(searchterm, isActive, pageIndex, (err, serviceResult) => {
    if (err) {
      err.status = err.status || 500;
      return next(err);
    }
    const PAGE_SIZE = 10;
    const totalCustomers = Array.isArray(serviceResult.customerCount) && serviceResult.customerCount[0]
      ? Number(serviceResult.customerCount[0].total_customers || serviceResult.customerCount[0].totalCustomers || 0)
      : 0;
    const actualOffset = Number(serviceResult.offset || 0);
    const rangeStart = totalCustomers > 0 ? actualOffset + 1 : 0;
    const rangeEnd = Math.min(actualOffset + PAGE_SIZE, totalCustomers);
    const activeStr = (isActive === "" || isActive === null || isActive === undefined) ? "" : String(isActive);

    res.render("./staff/manageCustomers/manageCustomers.hbs", {
      serviceResult,
      query: { search: searchterm, active: activeStr, offset: actualOffset },
      totalCustomers,
      pageSize: PAGE_SIZE,
      rangeStart,
      rangeEnd
    });
  });
}

export function handlePostCustomerEdit (req, res, next){
  if (!checkAuthorisation(req, "STAFF")) {
    res.redirect("/login");
    return;
  }
  const userId = req.body.userId;

  res.redirect(`/customer/updateProfile/${userId}`);
}

export function handleToggleCustomerActivity (req, res, next){
  if (!checkAuthorisation(req, "STAFF")) {
    res.redirect("/login");
    return;
  }
  
  const customerId = req.body.customerId;
  if(!customerId){
    const error = new Error("Customer ID is required");
    error.status = 400;
    return next(error);
  }
  toggleCustomerActivityService(customerId, (err, response) => {
    if(err){
      err.status = err.status || 500;
      return next(err);
    }
    res.redirect(`/dashboard/manageCustomers?search=${response.customerEmail}`);
  });
}

export function handleCustomerDelete(req, res, next){
  if (!checkAuthorisation(req, "STAFF")) {
    res.redirect("/login");
    return;
  }

  const userId = req.body.userId;
  if(!userId){
    const error = new Error("userId is required");
    error.status = 400;
    return next(error);
  }
  deleteCustomerService(userId, (err, response) => {
    if(err){
      err.status = err.status || 500;
      return next(err);
    }
    res.redirect("/dashboard/manageCustomers");
  })
}

export function handleAddCopyToInventory(req, res, next){
  if (!checkAuthorisation(req, "STAFF")) {
    res.redirect("/login");
    return;
  }

  const selectedStore = parseInt(req.body.storeId, 10);
  const selectedMovie = parseInt(req.body.movieId, 10);
  // console.log(selectedStore);
  // console.log(selectedMovie);

  if(!selectedStore){
    const error = new Error("storeId is required");
    error.status = 400;
    return next(error);
  }
  if(!selectedMovie){
    const error = new Error("movieId is required");
    error.status = 400;
    return next(error);
  }

  inventoryDao.createNewInventoryCopy(selectedMovie, selectedStore, (err, response) => {
    if(err){
      const error = new Error("Error adding inventory copy");
      error.status = 500;
      error.message = err;
      return next(error);
    }
    res.redirect(`/dashboard/manageOrCreateMovies/manage/inventory/${selectedMovie}?storeId=${selectedStore}`);
  })
}

export function handleTakeInRental(req, res, next){
  if (!checkAuthorisation(req, "STAFF")) {
    res.redirect("/login");
    return;
  }

  const rentalId = parseInt(req.body.rentalId, 10);
  const selectedStore = parseInt(req.body.storeId, 10);
  const selectedMovie = parseInt(req.body.movieId, 10);

  if(!rentalId){
    const error = new Error("rentalId is required");
    error.status = 400;
    return next(error);
  }

  if(!selectedStore){
    const error = new Error("storeId is required");
    error.status = 400;
    return next(error);
  }

  if(!selectedMovie){
    const error = new Error("movieId is required");
    error.status = 400;
    return next(error);
  }

  inventoryDao.returnRental(rentalId, (err, response) => {
    if(err){
      const error = new Error("Error returning rental");
      error.status = 500;
      error.message = err;
      return next(error);
    }
    res.redirect(`/dashboard/manageOrCreateMovies/manage/inventory/${selectedMovie}?storeId=${selectedStore}`);
  })
}

export function selectRentingCustomer(req, res, next){
  if (!checkAuthorisation(req, "STAFF")) {
    res.redirect("/login");
    return;
  }

  // Grab inventoryid from query string and parse as int
  const inventoryId = parseInt(req.query.inventoryId, 10);
  // Also capture movie and store context for proper redirect later
  const movieId = parseInt(req.query.movieId, 10);
  const storeIdRaw = parseInt(req.query.storeId, 10);
  const storeId = Number.isFinite(storeIdRaw) && storeIdRaw > 0 ? storeIdRaw : 1;

  // Also capture rental metadata from query (camelCase)
  const rentalDuration = req.query.rentalDuration;
  const rentalRate = req.query.rentalRate;
  const replacementCost = req.query.replacementCost;

  // Setting params for customer search service.
  const searchterm = req.query.search || "";
  let isActive = parseInt(req.query.active, 10);
  if (isNaN(isActive)) isActive = "";
  // 'offset' in query is treated as row offset (0, 10, 20, ...)
  let rowOffset = parseInt(req.query.offset, 10);
  if (isNaN(rowOffset)) rowOffset = 0;
  // Service expects page index and multiplies by 10 internally
  const pageIndex = Math.floor(rowOffset / 10);

  findCustomerByFirstLastOrEmail(searchterm, isActive, pageIndex, (err, serviceResult) => {
    if (err) {
      err.status = err.status || 500;
      return next(err);
    }
    const PAGE_SIZE = 10;
    const totalCustomers = Array.isArray(serviceResult.customerCount) && serviceResult.customerCount[0]
      ? Number(serviceResult.customerCount[0].total_customers || serviceResult.customerCount[0].totalCustomers || 0)
      : 0;
    const actualOffset = Number(serviceResult.offset || 0);
    const rangeStart = totalCustomers > 0 ? actualOffset + 1 : 0;
    const rangeEnd = Math.min(actualOffset + PAGE_SIZE, totalCustomers);
    const activeStr = (isActive === "" || isActive === null || isActive === undefined) ? "" : String(isActive);

    res.render("./staff/manageCustomers/manageCustomersForRent.hbs", {
      serviceResult,
      query: { search: searchterm, active: activeStr, offset: actualOffset, rentalDuration, rentalRate, replacementCost, movieId, storeId },
      totalCustomers,
      pageSize: PAGE_SIZE,
      rangeStart,
      rangeEnd,
      inventoryId,
      movieId,
      storeId,
      rentalDuration,
      rentalRate,
      replacementCost
    });
  });
}

export function handleMakeRental(req, res, next){
  if (!checkAuthorisation(req, "STAFF")) {
    res.redirect("/login");
    return;
  }

  const userId = req.session.user_id;
  const customerId = parseInt(req.body.customerId, 10);
  const inventoryId = parseInt(req.body.inventoryId, 10);
  const movieId = parseInt(req.body.movieId, 10);
  const storeId = parseInt(req.body.storeId, 10);

  if (!customerId) {
    const error = new Error("customerId is required");
    error.status = 400;
    return next(error);
  }
  if (!inventoryId) {
    const error = new Error("inventoryId is required");
    error.status = 400;
    return next(error);
  }
  if (!movieId) {
    const error = new Error("movieId is required for redirect");
    error.status = 400;
    return next(error);
  }
  if (!storeId) {
    const error = new Error("storeId is required for redirect");
    error.status = 400;
    return next(error);
  }

  makeNewRentalService(userId, customerId, inventoryId, (err, result) => {
    if (err) {
      err.status = err.status || 500;
      return next(err);
    }
    res.redirect(`/dashboard/manageOrCreateMovies/manage/inventory/${movieId}?storeId=${storeId}`);
  });

}

export function manageStores(req, res, next){
  if (!checkAuthorisation(req, "STAFF")) {
    res.redirect("/login");
    return;
  }
  const selectedStoreRaw = parseInt(req.query.storeId, 10);
  const selectedStore = Number.isFinite(selectedStoreRaw) && selectedStoreRaw > 0 ? selectedStoreRaw : 1;

  storeDashboardDao.getStores((errStores, stores) => {
    if (errStores) {
      errStores.status = 500;
      return next(errStores);
    }
    storeDashboardDao.getStoreStats(selectedStore, (errStats, rows) => {
      if (errStats) {
        errStats.status = 500;
        return next(errStats);
      }
      const stats = Array.isArray(rows) && rows[0] ? rows[0] : null;
      res.render("./staff/manageStores.hbs", { stores, selectedStore, stats });
    });
  });
}
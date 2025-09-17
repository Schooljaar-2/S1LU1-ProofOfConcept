import {
  getMovieByID,
  checkMovieAvailabilityAndTotalInventoryPerStoreByID,
  getAllMovieCategories,
  getAllMovieRatings,
  getFilteredMovies,
  getFilteredMoviesCount,
} from "../database/dao/Customer/movies.js";
import customerDao from "../database/dao/Customer/customer.js";
import createNewCustomerProfile from "../services/customer/addNewCustomer.service.js";
import getAllUserRentalInformation from "../services/customer/getCustomerRentalInformation.service.js"

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
    "f.length DESC",
  ];

  // Read all filter params from query, default to empty string
  const title = req.query.title || "";
  const rating = req.query.rating || "";
  const category = req.query.category || "";
  const orderBy = req.query.sort || "";
  var pagination = parseInt(req.query.pagination, 10);

  if (isNaN(pagination) || pagination <= 0) pagination = 10;

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
        if (pagination > amount) pagination = amount;

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

            res.render("./customer/movies.hbs", {
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

export function loggedInCustomer(req, res, next) {
  if (!req.session.logged_in) {
    res.redirect("/");
    return;
  }
  if (req.session.role !== "CUSTOMER" || !req.session.role) {
    res.redirect("/");
    return;
  }

  const userId = req.session.user_id;

  customerDao.getAllCustomerPersonalInformationByUserId(userId, (err, customerInfo) => {
    if (err) {
      const error = new Error("User ID not found");
      error.status = 404;
      return next(error);
    }

    if (!customerInfo || customerInfo.length === 0) {
      res.redirect("/customer/createProfile");
      return;
    }
    // Code for getting active rentals as wel as the rental history
    getAllUserRentalInformation(userId, (err, rentalInformation) => {
      if (err) {
        const error = new Error("User ID not found");
        error.status = 404;
        return next(error);
      }
      console.log(rentalInformation);
      res.render("./customer/customer.hbs", { customerInfo: customerInfo[0], rentalInformation });
    });
  });
}

export function customerCreateProfile(req, res, next) {
  if (!req.session.logged_in) {
    res.redirect("/");
    return;
  }
  if (req.session.role !== "CUSTOMER" || !req.session.role) {
    res.redirect("/");
    return;
  }

  //If user info exists go back
  const userId = req.session.user_id;
  customerDao.getAllCustomerPersonalInformationByUserId(userId, (err, customerInfo) => {
    if (err) {
      const error = new Error("User ID not found");
      error.status = 404;
      return next(error);
    }
    if (customerInfo && customerInfo.length !== 0) {
      res.redirect("/customer");
      return;
    }

  customerDao.findAllStores((err, stores) => {
      if (err) {
          const error = {
              status: 500,
              message: "Internal Server Error (city check)",
              details: err
          };
          return callback(error, null);
      }
      res.render("./customer/createProfile.hbs", { stores });
    })
  });
}

export function createProfileSendForm(req, res, next) {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const phone = req.body.phone;
  const district = req.body.district;
  const street = req.body.street;
  const houseNumber = req.body.houseNumber;
  const postalCode = req.body.postalCode;
  const city = req.body.city;
  const country = req.body.country;
  const storeId = req.body.store;

  createNewCustomerProfile(firstName, lastName, phone, district, street, houseNumber, postalCode, city, country, req.session.user_id, storeId, (err, result) => {
    if (err) {
      err.status = 500;
      return next(err);
    }
    res.redirect("/customer");
  });
}

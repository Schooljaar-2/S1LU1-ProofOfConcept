import { handleRegister, handleLogin } from "../services/auth.service.js";
import { getTop10Films } from "../database/dao/movies.js";

export function login(req, res) {
  res.render("./auth/login", { success: null, err: null });
}

export function register(req, res) {
  res.render("./auth/register", { err: null });
}

export function postLogin(req, res) {
  const credentials = {
    email: req.body.email,
    password: req.body.password,
  };

  handleLogin(credentials, (err, result) => {
    if (err) {
      res.render("./auth/login", {
        email: credentials.email,
        err: err.message || err,
      });
      return;
    }
    // On successful login, fetch top 10 films and render homepage with carousel
    getTop10Films((error, response) => {
      if (error) {
        // Optionally, handle this error differently
        res.render("./index", {
          hotMoviesGrouped: [],
          err: "Could not load movies.",
        });
        return;
      }
      // Use the same chunking logic as indexController
      const hotMoviesGrouped = chunkArray(response, 3);
      res.render("index", { hotMoviesGrouped });
    });
  });
  // Utility function to chunk arrays (copied from indexController)
  function chunkArray(arr, size) {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }
}

export function postRegister(req, res) {
  const credentials = {
    email: req.body.email,
    password: req.body.password,
  };

  handleRegister(credentials, (err, result) => {
    if (err) {
      res.render("./auth/register", {
        email: credentials.email,
        err: err.message || err,
      });
      return;
    }
    // Render login page with success message
    res.render("./auth/login", { success: result.message });
  });
}

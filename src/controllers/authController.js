import { handleRegister, handleLogin } from "../services/auth.service.js";

export function login(req, res) {
  const success = req.query.success ? "Register successful" : null;
  console.log(success)
  res.render("./auth/login", { success, err: null });
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
    // On successful login, redirect to homepage
    res.redirect("/");
  });
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
  // Redirect to login page with success query param
  res.redirect("/login?success=1");
  });
}

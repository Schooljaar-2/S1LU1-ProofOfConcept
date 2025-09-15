import {handleRegister, handleLogin} from "../services/auth.service.js"

export function login(req, res) {
  res.render("./auth/login", { success: null, err: null});
}

export function register(req, res) {
  res.render("./auth/register", {err: null});
}

export function postLogin(req, res) {
  const credentials = {
    email: req.body.email,
    password: req.body.password
  };

  handleLogin(credentials, (err, result) => {
    if (err) {
      res.render("./auth/login", { email: credentials.email, err: err.message || err});
      return;
    }
  // Render homepage with login and register now changed to profile...
  res.render("./index");
  });
}

export function postRegister(req, res) {
  const credentials = {
    email: req.body.email,
    password: req.body.password
  };

  handleRegister(credentials, (err, result) => {
    if (err) {
        res.render("./auth/register", { email: credentials.email, err: err.message || err });
      return;
    }
  // Render login page with success message
  res.render("./auth/login", { success: result.message });
  });
}

import { handleRegister, handleLogin } from "../services/auth.service.js";

export function login(req, res) {
  const success = req.query.success ? "Register successful" : null;
  // console.log(success);
  res.render("./auth/login", { success, err: null });
}

export function register(req, res) {
  res.render("./auth/register", { err: null });
}

export function postLogin(req, res, next) {
  const credentials = {
    email: req.body.email,
    password: req.body.password,
  };

  handleLogin(credentials, (err, result) => {
    if (err) {
      // If it's an expected login error, show it on the login page
      return res.render("./auth/login", { err: err.message || "Incorrect e-mail or password", success: null, email: credentials.email });
    }
    // On successful login, redirect to homepage and update session object
    req.session.logged_in = true;
    req.session.role = result.user[0].role;
    req.session.user_id = result.user[0].user_id;
    req.session.username = result.user[0].username;
    res.redirect("/");
  });
}

export function postRegister(req, res, next) {
  const credentials = {
    email: req.body.registerEmail,
    password: req.body.registerPassword,
    username: req.body.registerUsername,
  };

  handleRegister(credentials, (err, result) => {
    if (err) {
      // If it's an expected register error, show it on the register page
      return res.render("./auth/register", { err: err.message, email: credentials.email, username: credentials.username });
    }
    // Redirect to login page with success query param
    res.redirect("/login?success=1");
  });
}

export function logout(req, res) {
  req.session.destroy((err, next) => {
    if (err) return next(err);
    res.clearCookie('connect.sid'); 
    res.redirect("/");
  });
}
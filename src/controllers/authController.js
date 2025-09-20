import { handleRegister, handleLogin } from "../services/auth.service.js";

// Redirect to the login page
export function login(req, res) {
  if(req.session.logged_in){
    res.redirect("/");
    return;
  }
  const success = req.query.success ? "Register successful" : null;
  res.render("./auth/login", { success, err: null });
}

// Redirect to register page, locked out if already logged in
export function register(req, res) {
    if(req.session.logged_in){
      res.redirect("/");
      return;
    }
  res.render("./auth/register", { err: null });
}

// Get the credentials from body and pass them to handle login from auth.service.js
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

// Get the credentials from body and pass them to handle register function. 
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

// Clear out the session and redirect to homepage. 
export function logout(req, res) {
  req.session.destroy((err, next) => {
    if (err) return next(err);
    res.clearCookie('connect.sid'); 
    res.redirect("/");
  });
}
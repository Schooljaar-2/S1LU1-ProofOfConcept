import {handleRegister} from "../services/auth.service.js"

export function login(req, res) {
  res.render("./auth/login");
}

export function register(req, res) {
  res.render("./auth/register");
}

export function postLogin(req, res) {

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
    res.redirect("/login");
  });

}

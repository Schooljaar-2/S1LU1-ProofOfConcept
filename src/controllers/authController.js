import { handleLogin } from "../services/auth.service";

export function login(req, res) {
  res.render("./auth/login");
}

export function register(req, res) {
  res.render("./auth/register");
}

export function postLogin(req, res) {}

export function postRegister(req, res) {}

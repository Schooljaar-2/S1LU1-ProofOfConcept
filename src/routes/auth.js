import express from "express";
import {
  login,
  register,
  postLogin,
  postRegister,
} from "../controllers/authController.js";
const router = express.Router();

router.get("/login", login);
router.get("/register", register);

router.post("/login", postLogin);
router.post("/register", postRegister);

export default router;

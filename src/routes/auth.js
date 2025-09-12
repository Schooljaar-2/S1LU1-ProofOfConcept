import express from "express";
import { login, register } from "../controllers/authController.js";
const router = express.Router();

router.get("/login", login);
router.get("/register", register);

export default router;

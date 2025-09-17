import express from "express";
import {index, about} from "../controllers/indexController.js";
const router = express.Router();

/* GET home page. */
router.get("/", index);
router.get("/about", about);

export default router;

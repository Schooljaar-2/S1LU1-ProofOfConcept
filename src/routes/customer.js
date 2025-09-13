import express from "express";
import { movies, moviePage } from "../controllers/customerController.js";
const router = express.Router();

router.get("/movies", movies);
router.get("/movies/:movieID", moviePage);

export default router;

import express from "express";
import {
  dashboard,
  manageOrCreateMovies,
  createNewMovie,
  handlePostCreateNewMovie,
} from "../controllers/staffController.js";
const router = express.Router();

router.get("/dashboard", dashboard);

// Manage movies
router.get("/dashboard/manageOrCreateMovies", manageOrCreateMovies);
router.get("/dashboard/manageOrCreateMovies/create", createNewMovie);

router.post("/dashboard/manageOrCreateMovies/create", handlePostCreateNewMovie);

export default router;

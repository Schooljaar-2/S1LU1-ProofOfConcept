import express from "express";
import {
  dashboard,
  manageOrCreateMovies,
  createNewMovie,
  handleCreateNewMovie,
} from "../controllers/staffController.js";
const router = express.Router();

router.get("/dashboard", dashboard);

// Manage movies
router.get("/dashboard/manageOrCreateMovies", manageOrCreateMovies);
router.get("/dashboard/manageOrCreateMovies/create", createNewMovie);

router.post("/dashboard/manageOrCreateMovies/create", handleCreateNewMovie);

export default router;

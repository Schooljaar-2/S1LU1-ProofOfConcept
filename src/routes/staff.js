import express from "express";
import {
  dashboard,
  manageOrCreateMovies,
  createNewMovie,
  handlePostCreateNewMovie,
  staffPage,
} from "../controllers/staffController.js";
const router = express.Router();

// Base
router.get("/dashboard", dashboard);
router.get("/staff", staffPage);

// Manage movies
router.get("/dashboard/manageOrCreateMovies", manageOrCreateMovies);
router.get("/dashboard/manageOrCreateMovies/create", createNewMovie);

router.post("/dashboard/manageOrCreateMovies/create", handlePostCreateNewMovie);

export default router;

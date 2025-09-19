import express from "express";
import {
  dashboard,
  manageOrCreateMovies,
  createNewMovie,
  handlePostCreateNewMovie,
  staffPage,
  manageMovies,
  editMovies,
  manageInventories,
  handlePostEditMovie,
  manageCustomers
} from "../controllers/staffController.js";
const router = express.Router();

// Base
router.get("/dashboard", dashboard);
router.get("/staff", staffPage);

// Manage movies
router.get("/dashboard/manageOrCreateMovies", manageOrCreateMovies);
router.get("/dashboard/manageOrCreateMovies/create", createNewMovie);
router.get("/dashboard/manageOrCreateMovies/manage", manageMovies);
router.get("/dashboard/manageOrCreateMovies/manage/edit/:movieID", editMovies);
router.get("/dashboard/manageOrCreateMovies/manage/inventory/:movieID", manageInventories);

router.post("/dashboard/manageOrCreateMovies/create", handlePostCreateNewMovie);
router.post("/dashboard/manageOrCreateMovies/manage/edit", handlePostEditMovie);

// Manage customers
router.get("/dashboard/manageCustomers", manageCustomers);

export default router;

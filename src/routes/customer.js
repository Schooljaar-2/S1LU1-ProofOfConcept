import express from "express";
import {
  movies,
  moviePage,
  loggedInCustomer,
} from "../controllers/customerController.js";
const router = express.Router();

router.get("/movies", movies);
router.get("/movies/:movieID", moviePage);
router.get("/customer", loggedInCustomer);

export default router;

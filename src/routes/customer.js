import express from "express";
import {
  movies,
  moviePage,
  loggedInCustomer,
  customerCreateProfile,
} from "../controllers/customerController.js";
const router = express.Router();

router.get("/movies", movies);
router.get("/movies/:movieID", moviePage);
router.get("/customer", loggedInCustomer);
router.get("/customer/createProfile", customerCreateProfile);

export default router;

import express from "express";
import {
  movies,
  moviePage,
  loggedInCustomer,
  customerCreateProfile,
  createProfileSendForm,
  updateCustomerProfile,
} from "../controllers/customerController.js";
const router = express.Router();

router.get("/movies", movies);
router.get("/movies/:movieID", moviePage);
router.get("/customer", loggedInCustomer);
router.get("/customer/createProfile", customerCreateProfile);
router.get("/customer/updateProfile", updateCustomerProfile);

router.post("/customer/createProfile", createProfileSendForm);

export default router;

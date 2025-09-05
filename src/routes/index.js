import express from "express";
const router = express.Router();

/* GET home page. */
router.get("/", (req, res, next) => {
  res.render("index", { title: "Express", page: "" });
});

router.get("/frikandel", (req, res, next) => {
  res.render("frikandel");
});

export default router;

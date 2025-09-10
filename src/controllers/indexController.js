import { getTop10Films } from "../database/dao/movies.js";

export const index = (req, res, next) => {
  getTop10Films((error, response) => {
    if (error) return next(error);
    res.render("index", { title: "Express", page: "", movies: response });
  });
};
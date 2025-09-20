import { getTop10Films } from "../database/dao/customer/movies.js";

// Split for carousel
function chunkArray(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export const index = (req, res, next) => {
  getTop10Films((error, response) => {
    if (error) return next(error);

    const hotMoviesGrouped = chunkArray(response, 3);
    res.render("index", { hotMoviesGrouped });
  });
};

export const about = (req, res) => {
  res.render("about");
}

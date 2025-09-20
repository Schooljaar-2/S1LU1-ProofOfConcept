import { getTop10Films } from "../database/dao/customer/movies.js";

// Split for carousel
function chunkArray(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

// Render the index page with populair movies gathered from DAO and run through chunkarray function. 
export const index = (req, res, next) => {
  getTop10Films((error, response) => {
    if (error) return next(error);

    const hotMoviesGrouped = chunkArray(response, 3);
    res.render("index", { hotMoviesGrouped });
  });
};

// Render the about page. Page is non-dynamic, not much going on here. 
export const about = (req, res) => {
  res.render("about");
}

import { getTop10Films } from "../database/dao/movies.js";

// Kleine utility functie om arrays in chunks te splitsen
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

    // Deel films op in groepjes van 3 voor de carousel
    const hotMoviesGrouped = chunkArray(response, 3);
    res.render("index", { hotMoviesGrouped });
  });
};

// Import the DB func

export function movies(req, res) {
  res.render("./customer/movie.hbs");
}

export function moviePage(req, res) {
  const movieID = req.params.movieID;
  // Use movieID to look up the movie and render the page
  // Example: res.render('customer/movie.hbs', { movieID });
}

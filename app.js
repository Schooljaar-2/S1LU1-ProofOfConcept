import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { create } from "express-handlebars";
import session from "express-session";

import indexRouter from "./src/routes/index.js";
import authRouter from "./src/routes/auth.js";
import customerRouter from "./src/routes/customer.js";

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), "src/public")));

app.use(
  session({
    secret: "geheime_sleutel",
    resave: false,
    saveUninitialized: false,
    // Add cookie
  })
);

// Add middleware gebruikers info beschikbaar maken in views.
// Hieronder code van docent
// app.use((req, res, next) => {
//   res.locals.isAuthenticated = !!req.session.user
//   res.locals.username = req.session.user ? req.session.user.username : null
//   next()
// });

// View config
const handlebars = create({
  extname: "hbs",
  layoutsDir: path.join("src/views/layouts"),
  defaultLayout: "main",
  helpers: {
    ifCond: function (v1, v2, options) {
      return v1 === v2 ? options.fn(this) : options.inverse(this);
    },
  },
});
app.engine("hbs", handlebars.engine);
app.set("view engine", "hbs");
app.set("views", path.join(process.cwd(), "src/views"));

// Routes
app.use("/", indexRouter);
app.use("/", authRouter);
app.use("/", customerRouter);

// Error handling
app.use((req, res, next) => {
  const err = new Error("Page Not Found");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render("error", { error: err });
});

app.listen(3000, "localhost", () => {
  console.log("Now listening on http://localhost:" + 3000);
});

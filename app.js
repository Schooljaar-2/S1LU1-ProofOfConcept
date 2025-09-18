import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { create } from "express-handlebars";
import session from "express-session";

import indexRouter from "./src/routes/index.js";
import authRouter from "./src/routes/auth.js";
import customerRouter from "./src/routes/customer.js";
import staffRouter from "./src/routes/staff.js"

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), "src/public")));

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60000 * 60, //User being remembered for 1 hour
    },
  })
);

// View config
const handlebars = create({
  extname: "hbs",
  layoutsDir: path.join("src/views/layouts"),
  defaultLayout: "main",
  helpers: {
    ifCond: function (v1, v2, options) {
      return v1 === v2 ? options.fn(this) : options.inverse(this);
    },
    eq: function (a, b) {
      return a === b;
    },
    formatDate: function(date) {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d)) return date;
      // Format: YYYY-MM-DD HH:mm
      const pad = n => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    },
  },
});

app.engine("hbs", handlebars.engine);
app.set("view engine", "hbs");
app.set("views", path.join(process.cwd(), "src/views"));

// Middleware to make loggedInUser available in all views
app.use((req, res, next) => {
  if (req.session.logged_in) {
    res.locals.loggedInUser = {
      role: req.session.role,
      username: req.session.username,
      userId: req.session.user_id,
    };
  } else {
    res.locals.loggedInUser = null;
  }
  next();
});

// Routes
app.use("/", indexRouter);
app.use("/", authRouter);
app.use("/", customerRouter);
app.use("/", staffRouter);

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

const port = process.env.PORT || 3000;
const host = "0.0.0.0";

app.listen(port, host, () => {
  const displayHost = process.env.PORT ? host : "localhost";
  console.log(`Now listening on http://${displayHost}:${port}`);
});

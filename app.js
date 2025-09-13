import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { create } from "express-handlebars";

import indexRouter from "./src/routes/index.js";
import authRouter from "./src/routes/auth.js";
import customerRouter from "./src/routes/customer.js";

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), "src/public")));

// View config
const handlebars = create({
  extname: "hbs",
  layoutsDir: path.join("src/views/layouts"),
  defaultLayout: "main",
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

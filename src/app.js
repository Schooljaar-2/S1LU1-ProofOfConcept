import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import {create} from "express-handlebars"

import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), "src/public")));

// View config
const handlebars = create({
    extname:"hbs",
    layoutsDir:path.join("src/views/layouts"),
    defaultLayout:"main",
});
app.engine("hbs", handlebars.engine);
app.set("view engine", "hbs");
app.set("views", path.join(process.cwd(), "src/views"));

// Routes
app.use("/", indexRouter);
app.use("/users", usersRouter);

app.listen(3000, "localhost", () => {
  console.log("Now listening on http://localhost:" + 3000);
});

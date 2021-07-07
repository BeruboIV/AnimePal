const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");

const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");

const animeRoutes = require("./routes/animes");
const commentRoutes = require("./routes/comments");
const userRoutes = require("./routes/users");

const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStratergy = require("passport-local");
const User = require("./models/user");

mongoose
    .connect("mongodb://localhost:27017/AnimePal", {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then(() => {
        console.log("Database connected");
    })
    .catch((err) => {
        console.log("Error");
        console.log(err);
    });

// MIDDLEWARES

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "views")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const sessionConfig = {
    secret: "BeruboIV",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // Expires after 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
};
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); //  1.For persistent login sessions 2. Needs to be written after app.use(session())
passport.use(new LocalStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // How to serialize a user. Serialization -> How to store a user in a session
passport.deserializeUser(User.deserializeUser()); // Deserialization -> How to get a user out of a session

// Should be before route handlers
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use("/", userRoutes);
app.use("/animes", animeRoutes);
app.use("/animes/:animeId/comments", commentRoutes);

// Home page
app.get("/", (req, res) => {
    res.render("home");
});

app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = "Oh No, Something went wrong";
    }
    res.status(statusCode).render("partials/error.ejs", { err });
});

app.listen(3000, () => {
    console.log("Listening at PORT 3000...");
});

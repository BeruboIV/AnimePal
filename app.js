const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Anime = require("./models/anime"); // Requiring the model
const Review = require("./models/review");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const { animeSchema } = require("./schemas.js");

const animes = require("./routes/animes");

mongoose
    .connect("mongodb://localhost:27017/AnimePal", {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
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

app.use("/animes", animes);

// Home page
app.get("/", (req, res) => {
    res.render("home");
});

app.post(
    "/animes/:id/reviews",
    catchAsync(async (req, res) => {
        const anime = await Anime.findById(req.params.id);
        const review = new Review(req.body.review);
        anime.reviews.push(review);
        await review.save();
        await anime.save();
        res.redirect(`/animes/${anime._id}`);
    })
);

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

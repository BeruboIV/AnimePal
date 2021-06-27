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

const validateAnime = (req, res, next) => {
    const { error } = animeSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    }
    // We don't need an else block as the function will terminate after "throw" is used. If there is a catch block, control will be handled over to the catch.
    next();
    // console.log(result);
};

// Home page
app.get("/", (req, res) => {
    res.render("home");
});

// All animes
app.get("/animes", async (req, res) => {
    const animes = await Anime.find({});
    res.render("animes/index", { animes });
});

// Display page to add new anime
app.get("/animes/new", (req, res) => {
    res.render("animes/new");
});

// Create a new anime
app.post(
    "/animes",
    validateAnime,
    catchAsync(async (req, res, next) => {
        // Data format : { anime : { title : "", genre : "", description : "" } } -> We get an object with value as a sub-object
        // if (!req.body.anime) throw new ExpressError("Incomplete Data", 400); // Since this is wrapped inside catchAsync, the catch() will catch the thrown error and pass it to next. So we don't have to pass it to next over here : next(new ExpressError()) would be wrong!!

        const anime = new Anime(req.body.anime);
        await anime.save();
        res.redirect(`/animes/${anime._id}`);
    })
);

// Show a particular anime
app.get(
    "/animes/:id",
    catchAsync(async (req, res) => {
        const anime = await Anime.findById(req.params.id);
        res.render("animes/show", { anime });
    })
);

// Go to edit page
app.get(
    "/animes/:id/edit",
    catchAsync(async (req, res) => {
        const anime = await Anime.findById(req.params.id);
        res.render("animes/edit", { anime });
    })
);

// Update anime -> Receive data to update to database
app.put(
    "/animes/:id",
    validateAnime,
    catchAsync(async (req, res) => {
        // Data format : { anime : { title : "", genre : "", description : "" } } -> We get an object with value as a sub-object
        const anime = await Anime.findByIdAndUpdate(req.params.id, {
            ...req.body.anime,
        });
        res.redirect(`/animes/${req.params.id}`);
    })
);

// FIXME : Make it admin restrictive
app.delete(
    "/animes/:id",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        await Anime.findByIdAndDelete(id);
        res.redirect("/animes");
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

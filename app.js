const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");

const Anime = require("./models/anime"); // Requiring the model
const Comment = require("./models/comment");

const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");

const { animeSchema, commentSchema } = require("./schemas.js");

const animes = require("./routes/animes");

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

app.use("/animes", animes);

// Home page
app.get("/", (req, res) => {
    res.render("home");
});

const validateComment = (req, res, next) => {
    const { error } = commentSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

app.post(
    "/animes/:id/comments",
    validateComment,
    catchAsync(async (req, res) => {
        const anime = await Anime.findById(req.params.id);
        const comment = new Comment(req.body.comment);
        anime.comments.push(comment);
        await comment.save();
        await anime.save();
        res.redirect(`/animes/${anime._id}`);
    })
);

app.post(
    "/animes/:animeId/comment/:commentId",
    validateComment,
    catchAsync(async (req, res) => {
        const comment = await Comment.findById(req.params.commentId);
        const subComment = new Comment(req.body.comment);
        subComment.parent = comment;
        comment.comments.push(subComment);
        await subComment.save();
        await comment.save();
        res.redirect(`/animes/${req.params.animeId}`);
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

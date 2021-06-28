const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const { animeSchema } = require("../schemas.js");

const Anime = require("../models/anime"); // Requiring the model

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

// All animes
router.get(
    "/",
    catchAsync(async (req, res) => {
        const animes = await Anime.find({});
        res.render("animes/index", { animes });
    })
);

// Display page to add new anime
router.get("/new", (req, res) => {
    res.render("animes/new");
});

// Create a new anime
router.post(
    "/",
    validateAnime,
    catchAsync(async (req, res, next) => {
        // Data format : { anime : { title : "", genre : "", description : "" } } -> We get an object with value as a sub-object
        // if (!req.body.anime) throw new ExpressError("Incomplete Data", 400); // Since this is wrroutered inside catchAsync, the catch() will catch the thrown error and pass it to next. So we don't have to pass it to next over here : next(new ExpressError()) would be wrong!!

        const anime = new Anime(req.body.anime);
        await anime.save();
        res.redirect(`/animes/${anime._id}`);
    })
);

// Show a particular anime
router.get(
    "/:id",
    catchAsync(async (req, res) => {
        const anime = await Anime.findById(req.params.id);
        res.render("animes/show", { anime });
    })
);

// Go to edit page
router.get(
    "/:id/edit",
    catchAsync(async (req, res) => {
        const anime = await Anime.findById(req.params.id);
        res.render("animes/edit", { anime });
    })
);

// Update anime -> Receive data to update to database
router.put(
    "/:id",
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
router.delete(
    "/:id",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        await Anime.findByIdAndDelete(id);
        res.redirect("/animes");
    })
);

module.exports = router;

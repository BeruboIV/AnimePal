const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");

const Anime = require("../models/anime"); // Requiring the model
const Comment = require("../models/comment");

const { isLoggedIn, validateAnime, isAuthor } = require("../middleware");

// All animes
router.get(
    "/",
    catchAsync(async (req, res) => {
        const animes = await Anime.find({});
        res.render("animes/index", { animes });
    })
);

// Display page to add new anime
router.get("/new", isLoggedIn, (req, res) => {
    res.render("animes/new");
});

// Create a new anime
router.post(
    "/",
    isLoggedIn,
    validateAnime,
    catchAsync(async (req, res, next) => {
        // Data format : { anime : { title : "", genre : "", description : "" } } -> We get an object with value as a sub-object
        // if (!req.body.anime) throw new ExpressError("Incomplete Data", 400); // Since this is wrroutered inside catchAsync, the catch() will catch the thrown error and pass it to next. So we don't have to pass it to next over here : next(new ExpressError()) would be wrong!!
        const anime = new Anime(req.body.anime);
        anime.author = req.user._id;
        await anime.save();
        req.flash("success", "Anime Successfully created!");
        res.redirect(`/animes/${anime._id}`);
    })
);

const arr = [];

// Show a particular anime
router.get(
    "/:id",
    catchAsync(async (req, res) => {
        const anime = await Anime.findById(req.params.id).populate("author");
        if (!anime) {
            req.flash("error", "Page does not exist");
            return res.redirect("/animes");
        }
        req.session.returnTo = req.originalUrl;
        catchAsync(async function () {
            let m = anime.comments.length;
            for (let j = 0; j < m; j++) {
                let id = anime.comments[j];
                const animeId = req.params.id;
                const stack = [];
                stack.push({
                    parent_comment_id: id,
                    curr_level: 2,
                });
                while (stack.length) {
                    const { parent_comment_id, curr_level } = stack.pop();
                    const comment = await Comment.findById(parent_comment_id);
                    const text = comment.body;
                    arr.push(
                        `
                        <div>
                        <button type="button" class="btn btn-link text-nowrap reply" id="${parent_comment_id}" style="margin-left: ${
                            curr_level - 1
                        }rem;">_Reply</button>
                        <br />
                        <p style="margin-left: ${curr_level}rem; white-space: pre-wrap;">${text}</p>
                        <form
                        action="/animes/${animeId}/comments/${parent_comment_id}"
                        method="POST"
                        class="${parent_comment_id}"
                        style="display: none; margin-left : ${
                            curr_level + 5
                        }rem"
                    >
                        <textarea
                            name="comment[body]"
                            id="body"
                            cols="60"
                            rows="4"
                            required
                        ></textarea>
                        <br />
                        <button type="submit" style="margin-left: 19.1rem">Submit</button>
                        <button type="button" id="${parent_comment_id}" style="margin-left: 1rem">
                            Cancel
                        </button>
                    </form>
                        </div>
                    `
                    );
                    let n = comment.comments.length;
                    for (let i = n - 1; i >= 0; i--) {
                        stack.push({
                            parent_comment_id: comment.comments[i],
                            curr_level: curr_level + 5,
                        });
                    }
                }
            }

            callback();
        })(callback);
        // We will render the page only after we have all the comments available to us.
        function callback() {
            res.render("animes/show", { anime, arr, req });
            while (arr.length) {
                arr.pop();
            }
        }
    })
);

// Go to edit page
router.get(
    "/:id/edit",
    isLoggedIn,
    isAuthor,
    catchAsync(async (req, res) => {
        const anime = await Anime.findById(req.params.id);
        res.render("animes/edit", { anime });
    })
);

// Update anime -> Receive data to update to database
router.put(
    "/:id",
    isLoggedIn,
    isAuthor,
    validateAnime,
    catchAsync(async (req, res) => {
        const anime = await Anime.findById(req.params.id);
        // Data format : { anime : { title : "", genre : "", description : "" } } -> We get an object with value as a sub-object
        await Anime.findByIdAndUpdate(req.params.id, {
            ...req.body.anime,
        });
        req.flash("success", "Anime Successfully updated!");
        res.redirect(`/animes/${req.params.id}`);
    })
);

// FIXME : Make it admin restrictive
router.delete(
    "/:id",
    isAuthor,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const anime = await Anime.findById(id);

        res.redirect("/animes");
    })
);

module.exports = router;

const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");

const Anime = require("../models/anime"); // Requiring the model
const Comment = require("../models/comment");

const { validateComment, isLoggedIn } = require("../middleware");

// Create a new comment
router.post(
    "/",
    isLoggedIn,
    validateComment,
    catchAsync(async (req, res) => {
        const anime = await Anime.findById(req.params.animeId);
        const comment = new Comment(req.body.comment);
        anime.comments.push(comment);
        await comment.save();
        await anime.save();
        // console.log(req);
        req.flash("success", "Comment successfully posted");
        res.redirect(`/animes/${anime._id}`);
    })
);

// Add a sub-comment
router.post(
    "/:parentCommentId",
    isLoggedIn,
    validateComment,
    catchAsync(async (req, res) => {
        const comment = await Comment.findById(req.params.parentCommentId);
        const subComment = new Comment(req.body.comment);
        subComment.parent = comment;
        comment.comments.push(subComment);
        await subComment.save();
        await comment.save();
        req.flash("success", "Comment successfully posted");
        res.redirect(`/animes/${req.params.animeId}`);
    })
);

module.exports = router;

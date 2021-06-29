const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const { commentSchema } = require("../schemas.js");

const Anime = require("../models/anime"); // Requiring the model
const Comment = require("../models/comment");

const validateComment = (req, res, next) => {
    const { error } = commentSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

// Create a new comment
router.post(
    "/",
    validateComment,
    catchAsync(async (req, res) => {
        const anime = await Anime.findById(req.params.animeId);
        const comment = new Comment(req.body.comment);
        anime.comments.push(comment);
        await comment.save();
        await anime.save();
        res.redirect(`/animes/${anime._id}`);
    })
);

// Add a sub-comment
router.post(
    "/:parentCommentId",
    validateComment,
    catchAsync(async (req, res) => {
        const comment = await Comment.findById(req.params.parentCommentId);
        const subComment = new Comment(req.body.comment);
        subComment.parent = comment;
        comment.comments.push(subComment);
        await subComment.save();
        await comment.save();
        res.redirect(`/animes/${req.params.animeId}`);
    })
);

module.exports = router;

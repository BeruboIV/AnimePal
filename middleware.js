const { animeSchema, commentSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");

const Anime = require("./models/anime"); // Requiring the model

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be signed in!");
        return res.redirect("/login");
    }
    next();
};

module.exports.validateAnime = (req, res, next) => {
    const { error } = animeSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    }
    // We don't need an else block as the function will terminate after "throw" is used. If there is a catch block, control will be handled over to the catch.
    next();
};

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const anime = await Anime.findById(id);
    if (!anime) {
        req.flash("error", "Cannot find that Anime");
        return res.redirect("/animes");
    }
    if (!anime.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that!!");
        return res.redirect(`/animes/${id}`);
    }
    next();
};

module.exports.validateComment = (req, res, next) => {
    const { error } = commentSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

module.exports.changeUrl = (req, res, next) => {
    req.originalUrl = "/animes/" + req.params.animeId;
    next();
};

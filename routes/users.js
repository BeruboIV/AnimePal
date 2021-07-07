const express = require("express");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");

router.get("/register", (req, res) => {
    res.render("users/register");
});

router.post(
    "/register",
    catchAsync(async (req, res, next) => {
        try {
            const { email, username, password } = req.body;
            const user = new User({ username, email });
            const registerdUser = await User.register(user, password); // A static method provided by passport local
            req.login(registerdUser, (err) => {
                if (err) return next(err);
                req.flash("success", "Welcome to AnimePal");
                res.redirect("/animes");
            });
        } catch (err) {
            req.flash("error", err.message);
            res.redirect("/register");
        }
    })
);

router.get("/login", (req, res) => {
    res.render("users/login");
});

//  passport.authenticate -> middleware to convert current password to hash and then check with the hashed password
router.post(
    "/login",
    passport.authenticate("local", {
        failureFlash: true,
        failureRedirect: "/login",
    }),
    (req, res) => {
        const redirectUrl = req.session.returnTo || "/animes";
        delete req.session.returnTo;
        req.flash("success", "Welcome back");
        res.redirect(redirectUrl);
    }
);

router.get("/logout", (req, res) => {
    req.logOut();
    const redirectUrl = req.session.returnTo || "/animes";
    delete req.session.returnTo;
    req.flash("success", "Goddbye!");
    res.redirect(redirectUrl);
});

module.exports = router;

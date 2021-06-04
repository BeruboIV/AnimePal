const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Anime = require("./models/anime"); // Requiring the model

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
app.post("/animes", async (req, res) => {
    // Data format : { anime : { title : "", character : "" } } -> We get an object with value as a subobject
    const anime = new Anime(req.body.anime);
    await anime.save();
    res.redirect(`/animes/${anime._id}`);
});

// Show a particular anime
app.get("/animes/:id", async (req, res) => {
    const anime = await Anime.findById(req.params.id);
    res.render("animes/show", { anime });
});

// Go to edit page
app.get("/animes/:id/edit", async (req, res) => {
    const anime = await Anime.findById(req.params.id);
    res.render("animes/edit", { anime });
});

// Update anime -> Receive data to update to database
app.put("/animes/:id", async (req, res) => {
    // Data format : { anime : { title : "", character : "" } } > We get an object with value as a subobject
    const anime = await Anime.findByIdAndUpdate(req.params.id, {
        ...req.body.anime,
    });
    res.redirect(`/animes/${req.params.id}`);
});

// FIXME : Make it admin restrictive
app.delete("/animes/:id", async (req, res) => {
    const { id } = req.params;
    await Anime.findByIdAndDelete(id);
    res.redirect("/animes");
});

app.listen(3000, () => {
    console.log("Listening at PORT 3000...");
});

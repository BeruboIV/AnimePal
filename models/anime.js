const mongoose = require("mongoose");
const Schema = mongoose.Schema; // Shortens monoose.Schema to Schema

const AnimeSchema = new Schema({
    title: String,
    character: String,
    image: String,
    description: String,
    location: String,
});

module.exports = mongoose.model("Anime", AnimeSchema);

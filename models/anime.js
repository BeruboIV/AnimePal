const mongoose = require("mongoose");
const Schema = mongoose.Schema; // Shortens monoose.Schema to Schema

const AnimeSchema = new Schema({
    title: String,
    genre: String,
    image: String,
    description: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
});

module.exports = mongoose.model("Anime", AnimeSchema);

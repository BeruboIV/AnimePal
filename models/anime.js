const mongoose = require("mongoose");
const Schema = mongoose.Schema; // Shortens monoose.Schema to Schema

const AnimeSchema = new Schema({
    title: String,
    genre: String,
    image: String,
    description: String,
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: "Comment",
        },
    ],
});

module.exports = mongoose.model("Anime", AnimeSchema);

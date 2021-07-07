const mongoose = require("mongoose");
const Schema = mongoose.Schema; // Shortens monoose.Schema to Schema

const commentSchema = new Schema({
    body: String,
    parent: {
        type: Schema.Types.ObjectId,
        ref: "Anime",
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: "Comment",
        },
    ],
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

module.exports = new mongoose.model("Comment", commentSchema);

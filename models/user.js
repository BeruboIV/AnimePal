const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true, // Sets up an index and is not considered for validation
    },
});

//  Adds a password and username field on its own
UserSchema.plugin(passportLocalMongoose);

module.exports = new mongoose.model("User", UserSchema);

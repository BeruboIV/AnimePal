const Joi = require("joi");

module.exports.animeSchema = Joi.object({
    anime: Joi.object({
        title: Joi.string().required(),
        genre: Joi.string().required(),
        description: Joi.string().required(),
    }).required(),
});

// anime : { title : "", genre : "", description : "" }

module.exports.commentSchema = Joi.object({
    comment: Joi.object({
        body: Joi.string().required(),
    }).required(),
});

// comment : { body : "" }

const Joi = require("joi");

module.exports.animeSchema = Joi.object({
    anime: Joi.object({
        title: Joi.string().required(),
        genre: Joi.string().required(),
        description: Joi.string().required(),
    }).required(),
});

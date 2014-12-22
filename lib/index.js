'use strict';

// Load modules

var Boom = require('boom');
var Hoek = require('hoek');
var Joi = require('joi');
var R = require('ramda');
var S = require('string');

// Declare internals

var internals = {};


internals.schema = {
    knex: Joi.object().keys({
        client: Joi.string().required(),
        connection: Joi.alternatives().when('client', {
                is: 'sqlite3',
                then: Joi.object().keys({
                    filename: Joi.string()
                }),
                otherwise: Joi.alternatives().try(Joi.object(), Joi.string())
        }).required()
    }),
    plugins: Joi.array().includes(Joi.string()),
    models: Joi.array().includes(Joi.string())
};


exports.register = function (server, options, next) {

    Joi.assert(options.knex, internals.schema.knex, 'Invalid options');

    var Bookshelf = require('bookshelf')(require('knex')(options.knex));

    if (R.isArrayLike(options.plugins)) {
        Joi.assert(options.plugins, internals.schema.plugins, 'Invalid plugin');
        R.map(R.lPartial(R.func('plugin'), Bookshelf), options.plugins);
    }

    if (R.isArrayLike(options.models)) {
        Joi.assert(options.models, internals.schema.models,
            'Invalid model path');
        R.map(R.rPartial(require, Bookshelf), options.models);
    }

    server.expose('bookshelf', Bookshelf);

    next();
};

exports.register.attributes = {
    pkg: require('../package.json')
};

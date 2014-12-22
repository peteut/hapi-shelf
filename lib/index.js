'use strict';

// Load modules

var Boom = require('boom');
var Hoek = require('hoek');
var Joi = require('joi');

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
};


exports.register = function (server, options, next) {

    Joi.assert(options, internals.schema.knex, 'Invalid options');

    var Bookshelf = require('knex')(options);

    server.expose('bookshelf', Bookshelf);

    return next();
};


exports.register.attributes = {
    pkg: require('../package.json')
};



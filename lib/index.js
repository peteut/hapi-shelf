'use strict';

// Load modules

//var Util = require('util');
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
                    .required()
        }).required()
    }),
    plugins: Joi.array().includes(Joi.string()),
    models: Joi.array().includes(Joi.string())
};

internals.schemaDefault = {
    plugins: ['registry']
};

internals.parse = function (attrs) {
    return R.zipObj(R.map(R.pipe(S, R.func('camelize'), R.prop('s')),
        R.keys(attrs)),
        R.values(attrs));
};

internals.format = function (attrs) {
    return R.zipObj(R.map(R.pipe(S, R.func('underscore'), R.prop('s')),
        R.keys(attrs)),
        R.values(attrs));
};

exports.register = function (server, options, next) {
    options = Hoek.applyToDefaults(internals.schemaDefault, options);
    try {
        Joi.assert(options.knex, internals.schema.knex, 'Invalid options');
    } catch (err) {
        return next(err);
    }
    try {
        var Bookshelf = require('bookshelf')(require('knex')(options.knex));
    } catch (err) {
        return next(new Error('Invalid knex options: ' + err.toString()));
    }
    Hoek.merge(Bookshelf.Model.prototype,
        R.pick(['parse', 'format'], internals));

    try {
        Joi.assert(options.plugins, internals.schema.plugins, 'Invalid plugin');
        R.map(R.lPartial(R.func('plugin'), Bookshelf), options.plugins);
    } catch (err) {
        return next(err);
    }
    if (R.isArrayLike(options.models)) {
        try {
            Joi.assert(options.models, internals.schema.models,
                'Invalid model path');
        } catch (err) {
            return next(err);
        }
        R.ap(R.map(require, options.models),
            R.repeatN(Bookshelf, R.length(options.models)));
    }
    server.expose(Bookshelf);
    next();
};

exports.register.attributes = {
    pkg: require('../package.json')
};

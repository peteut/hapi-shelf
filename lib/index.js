'use strict';

// Load modules

var Path = require('path');
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


internals._calleeIndex = R.pipe(
    R.findIndex(R.pipe(R.nth(3), R.eq('internals.Plugin.register'))),
    R.add(1));


exports.register = function (server, options, next) {

    options = Hoek.applyToDefaults(internals.schemaDefault, options);
    try {
        Joi.assert(options.knex, internals.schema.knex, 'Invalid options');
    }
    catch (error) {
        return next(error);
    }

    try {
        var Bookshelf = require('bookshelf')(require('knex')(options.knex));
    }
    catch (error) {
        return next(new Error('Invalid knex options: ' + error.toString()));
    }

    Hoek.merge(Bookshelf.Model.prototype,
        R.pick(['parse', 'format'], internals));

    try {
        Joi.assert(options.plugins, internals.schema.plugins, 'Invalid plugin');
        R.map(R.lPartial(R.func('plugin'), Bookshelf), options.plugins);
    }
    catch (error) {
        return next(error);
    }

    if (R.isArrayLike(options.models)) {
        try {
            Joi.assert(options.models, internals.schema.models,
                'Invalid model path');
        }
        catch (error) {
            return next(error);
        }
        var callStack = Hoek.callStack();
        var calleeDir = R.pipe(
            internals._calleeIndex,
            R.rPartial(R.nth, callStack),
            R.head,
            Path.dirname)(callStack);

        R.ap(R.map(require,
                R.map(R.lPartial(Path.join, calleeDir), options.models)),
            R.repeatN(Bookshelf, R.length(options.models)));
    }

    server.expose(Bookshelf);
    next();
};


exports.register.attributes = {
    pkg: require('../package.json')
};

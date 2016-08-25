'use strict';

// Load modules

const Path = require('path');
const Hoek = require('hoek');
const Joi = require('joi');
const R = require('ramda');
const S = require('string');

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
        }).required(),
        pool: Joi.object().keys({
          min: Joi.number().integer(),
          max: Joi.number().integer()
        }),
        useNullAsDefault: Joi.boolean(),
        migrations: Joi.object().keys({
          directory: Joi.string()
        }),
        seeds: Joi.object().keys({
          directory: Joi.string()
        }),
        debug: Joi.boolean(),
        acquireConnectionTimeout: Joi.number().integer()
    }),
    plugins: Joi.array().items(Joi.string()),
    models: Joi.array().items(Joi.string())
};


internals.schemaDefault = {
    plugins: ['registry']
};


internals.parse = function (attrs) {

    return R.zipObj(R.map(R.compose(R.prop('s'), R.invoker(0, 'camelize'), S),
                          R.keys(attrs)),
                          R.values(attrs));
};


internals.format = function (attrs) {

    return R.zipObj(R.map(R.compose(R.prop('s'), R.invoker(0, 'underscore'), S),
                          R.keys(attrs)),
                          R.values(attrs));
};


internals.calleeIndex = R.compose(
    R.add(1),
    R.findIndex(R.compose(R.identical('internals.Plugin.register'), R.nth(3))));


exports.register = function (server, options, next) {

    options = Hoek.applyToDefaults(internals.schemaDefault, options);
    Joi.assert(options, internals.schema, 'Invalid options');
    try {
        var bookshelf = require('bookshelf')(require('knex')(options.knex));
    }
    catch (error) {
        return next(new Error('Invalid knex options: ' + error.toString()));
    }

    Hoek.merge(bookshelf.Model.prototype,
               R.pick(['parse', 'format'], internals));

    R.map(R.flip(R.invoker(1, 'plugin'))(bookshelf), options.plugins);

    // bind model, collection methods
    var methods = R.pick(['model', 'collection'], bookshelf);
    Hoek.merge(bookshelf,
               R.zipObj(R.keys(methods),
                        R.map(R.flip(R.bind)(bookshelf), R.values(methods))));

    if (R.isArrayLike(options.models)) {
        var path = Path.parse(process.cwd());
        var fixPath = R.partial(Path.join, [path.dir, path.base]);

        R.map(R.compose(
            function (p) {

                require(p)(bookshelf);
            },
            fixPath), options.models);
    }

    server.expose(bookshelf);

    server.ext({
      type: 'onPostStop',
      method: function (server, next) {

        bookshelf.knex.destroy(next);
      }
    });

    next();
};


exports.register.attributes = {
    pkg: require('../package.json')
};

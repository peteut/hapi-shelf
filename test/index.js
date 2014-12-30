'use strict';

// Load modules

var Path = require('path');
var Hapi = require('hapi');
var Code = require('code');
var Lab = require('lab');
var R = require('ramda');

var Pkg = require('../package.json');
var HapiShelf = require('../');

// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;

//var inspect = R.rPartial(Util.inspect, false, null, true);
var throwIfError = R.ifElse(R.is(Error),
    function (err) {
        throw err;
    },
    function () { }
);

var getPlugin = R.pipe(R.prop('plugins'), R.prop(Pkg.name));

describe('Hapi-shelf', function () {

    describe('register()', function () {

        var optionsSqlite3WithModel = {
            knex: {
                client: 'sqlite3',
                connection: {
                    filename: './db.sqlite'
                }
            },
            models: [Path.join(__dirname, './models/simple')]
        };

        it('registers plugin w/ sqlite3', function (done) {

            var server = new Hapi.Server();
            server.register({ register: HapiShelf,
                options: R.omit(['plugins', 'models'],
                    optionsSqlite3WithModel) },
                function (err) {

                    expect(err).to.be.undefined();
                    expect(server.plugins[Pkg.name]).to.be.an.object();
                    done();
                }
            );
        });

        it('registers plugin w/ mysql connection string', function (done) {

            var options = {
                knex: {
                    client: 'mysql',
                    connection: 'connection string'
                }
            };
            var server = new Hapi.Server();
            server.register({ register: HapiShelf, options: options },
                function (err) {

                    expect(err).to.be.undefined();
                    expect(server.plugins[Pkg.name]).to.be.an.object();
                    done();
                }
            );
        });

        it('registers plugin w/ mysql connection objects', function (done) {

            var options = {
                knex: {
                    client: 'mysql',
                    connection: {}
                }
            };
            var server = new Hapi.Server();
            server.register({ register: HapiShelf, options: options },
                function (err) {

                    expect(err).to.be.undefined();
                    done();
                }
            );
        });

        it('returns an Error on bogus options.knex.connection', function (done) {

            var options = {
                knex: {
                    client: 'mysql'
                }
            };
            var server = new Hapi.Server();
            expect(
                function () {

                    return server.register({ register: HapiShelf,
                        options: options },
                        throwIfError);
                }
            ).to.throw(/Invalid options .+/);
            done();
        });

        it('returns an Error on bogus options.knex.client', function (done) {

            var options = {
                kne: {
                    client: 'bogos-client'
                }
            };
            var server = new Hapi.Server();
            expect(
                function () {

                    return server.register({ register: HapiShelf,
                        options: options },
                        throwIfError);
                }
            ).to.throw(/Invalid knex options: .+/);
            done();
        });

        it('registers plugin plugins', function (done) {

            var server = new Hapi.Server();
            server.register({ register: HapiShelf,
                options: optionsSqlite3WithModel },
                function (err) {

                    expect(err).to.be.undefined();
                    expect(server.plugins[Pkg.name]).to.be.an.object();
                    done();
                }
            );
        });

        it('returns an Error on bogus options.plugins', function (done) {
            var options = {
                knex: {
                    client: 'sqlite3',
                    connection: {
                        filename: './db.sqlite'
                    }
                },
                plugins: [123]
            };
            var server = new Hapi.Server();
            expect(
                function () {

                    server.register({ register: HapiShelf, options: options },
                        throwIfError);
                }
            ).to.throw(/Invalid plugin .+/);
            done();
        });

        it('loads models', function (done) {
            var server = new Hapi.Server();
            server.register({ register: HapiShelf,
                options: optionsSqlite3WithModel },
                function (err) {

                    expect(err).to.be.undefined();
                    expect(getPlugin(server)).to.be.an.object();
                    expect(getPlugin(server).model('Simple')).to.be.a.function();
                    done();
                }
            );
        });

        it('returns an Error on bogus options.models', function (done) {
            var server = new Hapi.Server();
            expect(
                function () {

                    server.register(
                        {
                            register: HapiShelf,
                            options: R.mixin(optionsSqlite3WithModel,
                                { models: [123] })
                        },
                        throwIfError);
                }
            ).to.throw(/Invalid model path .+/);
            done();
        });

        it('implements Model.parse()', function (done) {
            var server = new Hapi.Server();
            server.register({ register: HapiShelf,
                options: optionsSqlite3WithModel },
                function (err) {

                    if (err) {
                        throw err;
                    }
                    /* eslint-disable */
                    expect(
                        getPlugin(server).model('Simple').forge()
                        .parse({ foo_bar: 1 })
                    ).to.include('fooBar');
                    /* eslint-enable */
                    done();
                }
            );
        });

        it('implements Model.format()', function (done) {
            var server = new Hapi.Server();
            server.register({ register: HapiShelf,
                options: optionsSqlite3WithModel },
                function (err) {

                    if (err) {
                        throw err;
                    }
                    expect(
                        getPlugin(server).model('Simple').forge()
                        .format({ fooBar: 1 })
                    ).to.include('foo_bar');
                    done();
                }
            );
        });
    });
});

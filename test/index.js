'use strict';

// Load modules

var Hapi = require('hapi');
var Code = require('code');
var Lab = require('lab');
var R = require('ramda');

var Pkg = require('../package.json');
var HapiShelf = require('../');

// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var before = lab.before;
var after = lab.after;
var it = lab.it;
var expect = Code.expect;

var throwIfError = R.ifElse(R.is(Error),
    function (err) {

        throw err;
    },
    function () { }
);


var getPlugin = R.pipe(R.prop('plugins'), R.prop(Pkg.name));


describe('Hapi-shelf', function () {

    var server = null;

    before(function (done) {

        server = new Hapi.Server();
        done();
    });

   after(function (done) {

       server.stop(function () {

           done();
       });
   });

   describe('register()', function () {

        var optionsSqlite3WithModel = {
            knex: {
                client: 'sqlite3',
                connection: {
                    filename: './db.sqlite'
                }
            },
            models: ['./models/simple']
        };

        it('registers plugin w/ sqlite3', function (done) {

            server.register({ register: HapiShelf,
                options: R.omit(['plugins', 'models'],
                    optionsSqlite3WithModel) },
                function (err) {

                    expect(err).to.be.undefined();
                    expect(getPlugin(server)).to.be.an.object();
                    done();
                }
            );
        });

        it('registers plugin w/ debug enabled', function (done) {

            server.register({ register: HapiShelf,
                    options: R.mixin(optionsSqlite3WithModel, { debug: true })
                },
                function (err) {

                    expect(err).to.be.undefined();
                    expect(getPlugin(server)).to.be.an.object();
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
            server.register({ register: HapiShelf, options: options },
                function (err) {

                    expect(err).to.be.undefined();
                    expect(getPlugin(server)).to.be.an.object();
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
            expect(function () {

                return server.register({ register: HapiShelf,
                    options: options },
                    throwIfError);
            }).to.throw(/Invalid options .+/);
            done();
        });

        it('returns an Error on bogus options.knex.client', function (done) {

            var options = {
                knex: {
                    client: 'bogos-client',
                    connection: {}
                }
            };
            expect(function () {

                return server.register({ register: HapiShelf,
                    options: options },
                    throwIfError);
            }).to.throw(/Invalid knex options: .+/);
            done();
        });

        it('registers plugin plugins', function (done) {

            server.register({ register: HapiShelf,
                options: optionsSqlite3WithModel },
                function (err) {

                    expect(err).to.be.undefined();
                    expect(getPlugin(server)).to.be.an.object();
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
            expect(function () {

                server.register({ register: HapiShelf, options: options },
                    throwIfError);
            }).to.throw(/Invalid options .+/);
            done();
        });

        it('returns an Error on bogus (not available) options.plugins',
            function (done) {

                expect(function () {

                    server.register({ register: HapiShelf,
                        options: R.mixin(optionsSqlite3WithModel,
                            { plugins: ['bogos'] })
                        },
                        throwIfError);
                }).to.throw(/Cannot find module .+/);
                done();
            }
        );

        it('loads models', function (done) {
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
            expect(function () {

                server.register({ register: HapiShelf,
                    options: R.mixin(optionsSqlite3WithModel,
                        { models: [123] })
                },
                throwIfError);
            }).to.throw(/Invalid options .+/);
            done();
        });

        it('returns an Error on bogus (non existing) options.models',
            function (done) {
            expect(function () {

                server.register({ register: HapiShelf,
                    options: R.mixin(optionsSqlite3WithModel,
                        { models: ['bogus'] })
                },
                throwIfError);
            }).to.throw(/Cannot find module .+/);
            done();
        });

        it('implements Model.parse()', function (done) {
            server.register({ register: HapiShelf,
                options: optionsSqlite3WithModel },
                function (err) {

                    if (err) {
                        throw err;
                    }
                    /* eslint-disable */
                    expect(getPlugin(server).model('Simple').forge()
                        .parse({ foo_bar: 1 })
                    ).to.include('fooBar');
                    /* eslint-enable */
                    done();
                }
            );
        });

        it('implements Model.format()', function (done) {
            server.register({ register: HapiShelf,
                options: optionsSqlite3WithModel },
                function (err) {

                    if (err) {
                        throw err;
                    }
                    expect(getPlugin(server).model('Simple').forge()
                        .format({ fooBar: 1 })
                    ).to.include('foo_bar');
                    done();
                }
            );
        });
    });
});

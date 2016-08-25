'use strict';

// Load modules

const Hapi = require('hapi');
const Code = require('code');
const Lab = require('lab');
const Hoek = require('hoek');
const R = require('ramda');

const Pkg = require('../package.json');
const HapiShelf = require('../');

// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const before = lab.before;
const after = lab.after;
const it = lab.it;
const expect = Code.expect;

const throwIfError = R.ifElse(R.is(Error),
    function (err) {

        throw err;
    },
    function () { }
);


const getPlugin = R.pipe(R.prop('plugins'), R.prop(Pkg.name));


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

        const optionsSqlite3WithModel = {
            knex: {
                client: 'sqlite3',
                connection: {
                    filename: ':memory:'
                },
                useNullAsDefault: true,
                acquireConnectionTimeout: 10000
            },
            models: ['./test/models/simple']
        };

        it('registers plugin w/ sqlite3', function (done) {

            server.register({
                register: HapiShelf,
                options: R.omit(['plugins', 'models'],
                                optionsSqlite3WithModel)
            },
            function (err) {

                expect(err).to.not.exist();
                expect(getPlugin(server)).to.be.an.object();
                done();
            });
        });

        it('registers plugin w/ debug enabled', function (done) {

            server.register({
                register: HapiShelf,
                options: Hoek.applyToDefaults(optionsSqlite3WithModel,
                                              { knex: { debug: true } })
            },
            function (err) {

                expect(err).to.not.exist();
                expect(getPlugin(server)).to.be.an.object();
                done();
            });
        });

        it('registers plugin w/ mysql connection string', function (done) {

            const options = {
                knex: {
                    client: 'mysql',
                    connection: 'connection string'
                }
            };
            server.register({
                register: HapiShelf,
                options: options
            },
            function (err) {

                expect(err).to.not.exist();
                expect(getPlugin(server)).to.be.an.object();
                done();
            });
        });

        it('registers plugin w/ mysql connection objects', function (done) {

            const options = {
                knex: {
                    client: 'mysql',
                    connection: {}
                }
            };
            server.register({
                register: HapiShelf,
                options: options
            },
            function (err) {

                expect(err).to.be.undefined();
                done();
            });
        });

        it('returns an Error on bogus options.knex.connection', function (done) {

            const options = {
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

            const options = {
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

            const options = {
                knex: {
                    client: 'sqlite3',
                    connection: {
                        filename: ':memory:'
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
                                   options: R.merge(optionsSqlite3WithModel,
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
                                 expect(getPlugin(server).model('Simple')
                                       ).to.be.a.function();
                                 done();
                             }
                            );
         });

        it('returns an Error on bogus options.models', function (done) {
            expect(function () {

                server.register({ register: HapiShelf,
                    options: R.merge(optionsSqlite3WithModel,
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
                                options: R.merge(optionsSqlite3WithModel,
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
                    expect(getPlugin(server).model('Simple').forge()
                           /* eslint-disable */
                           .parse({ foo_bar: 1 })
                           /* eslint-enable */
                          ).to.include('fooBar');
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

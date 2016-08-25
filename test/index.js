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

const throwIfError = R.when(R.is(Error),
    (err) => {

        throw err;
    }
);


const getPlugin = R.pipe(R.prop('plugins'), R.prop(Pkg.name));


describe('Hapi-shelf', () => {

    let server = null;

    before((done) => {

        server = new Hapi.Server();
        done();
    });

    after((done) => server.stop(() => done()));

    describe('register()', () => {

        const optionsSqlite3WithModel = {
            knex: {
                client: 'sqlite3',
                connection: {
                    filename: ':memory:'
                },
                pool: { min: 1, max: 1 },
                useNullAsDefault: true,
                acquireConnectionTimeout: 1000
            },
            models: ['./test/models/simple']
        };

        it('registers plugin w/ sqlite3', (done) => {

            server.register({
                register: HapiShelf,
                options: R.omit(['plugins', 'models'],
                                optionsSqlite3WithModel)
            },
            (err) => {

                expect(err).to.not.exist();
                expect(getPlugin(server)).to.be.an.object();
                done();
            });
        });

        it('registers plugin w/ debug enabled', (done) => {

            server.register({
                register: HapiShelf,
                options: Hoek.applyToDefaults(optionsSqlite3WithModel,
                                              { knex: { debug: true } })
            },
            (err) => {

                expect(err).to.not.exist();
                expect(getPlugin(server)).to.be.an.object();
                done();
            });
        });

        it('returns an Error on bogus options.knex.connection', (done) => {

            const options = {
                knex: {
                    client: 'mysql'
                }
            };
            expect(() => {

                return server.register({
                    register: HapiShelf, options }, throwIfError);
            }).to.throw(/Invalid options .+/);
            done();
        });

        it('returns an Error on bogus options.knex.client', (done) => {

            const options = {
                knex: {
                    client: 'bogos-client',
                    connection: {}
                }
            };
            expect(() => {

                return server.register({
                    register: HapiShelf, options }, throwIfError);
            }).to.throw(/Invalid knex options: .+/);
            done();
        });

        it('registers plugin plugins', (done) => {

            server.register({ register: HapiShelf,
                            options: optionsSqlite3WithModel },
                            (err) => {

                                expect(err).to.be.undefined();
                                expect(getPlugin(server)).to.be.an.object();
                                done();
                            }
                           );
        });

        it('returns an Error on bogus options.plugins', (done) => {

            const options = {
                knex: {
                    client: 'sqlite3',
                    connection: {
                        filename: ':memory:'
                    }
                },
                plugins: [123]
            };
            expect(() => {

                server.register({
                    register: HapiShelf, options }, throwIfError);
            }).to.throw(/Invalid options .+/);
            done();
        });

        it('returns an Error on bogus (not available) options.plugins',
           (done) => {

               expect(() => {

                   server.register({ register: HapiShelf,
                       options: R.merge(optionsSqlite3WithModel,
                           { plugins: ['bogos'] })
                   },
                   throwIfError);
               }).to.throw(/Cannot find module .+/);
               done();
           }
          );

        it('loads models', (done) => {

            server.register({
                register: HapiShelf,
                options: optionsSqlite3WithModel },
                (err) => {

                    expect(err).to.be.undefined();
                    expect(getPlugin(server)).to.be.an.object();
                    expect(getPlugin(server).model('Simple')
                    ).to.be.a.function();
                    done();
                }
            );
        });

        it('returns an Error on bogus options.models', (done) => {

            expect(() => {

                server.register({ register: HapiShelf,
                    options: R.merge(optionsSqlite3WithModel,
                        { models: [123] })
                },
                throwIfError);
            }).to.throw(/Invalid options .+/);
            done();
        });

        it('returns an Error on bogus (non existing) options.models',
            (done) => {

                expect(() => {

                    server.register({ register: HapiShelf,
                        options: R.merge(optionsSqlite3WithModel,
                            { models: ['bogus'] })
                    },
                        throwIfError);
                }).to.throw(/Cannot find module .+/);
                done();
            }
        );

        it('implements Model.parse()', (done) => {

            server.register({ register: HapiShelf,
                options: optionsSqlite3WithModel },
                (err) => {

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

        it('implements Model.format()', (done) => {

            server.register({ register: HapiShelf,
                options: optionsSqlite3WithModel },
                (err) => {

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

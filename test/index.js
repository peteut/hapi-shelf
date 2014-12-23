'use strict';

// Load modules

var Path = require('path');
var Util = require('util');
var Hapi = require('hapi');
var Code = require('code');
var Lab = require('lab');
var Pkg = require('../package.json');
var R = require('ramda');
var Bookshelf = require('..');

// Declare internals

var internals = {};

// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;

var inspect = R.rPartial(Util.inspect, false, null, true);

var getPlugin = R.pipe(R.prop('plugins'), R.prop(Pkg.name));

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


    it('registers bookshelf w/ sqlite3', function (done) {
        var server = new Hapi.Server();
        server.register({register: Bookshelf,
            options: R.omit(['plugins', 'models'], optionsSqlite3WithModel)},
            function (err) {
                expect(err).to.be.undefined();
                expect(server.plugins[Pkg.name]).to.be.an.object();
                done();
            });
    });

    it('registers bookshelf w/ mysql connection string', function (done) {
        var options = {
            knex: {
                client: 'mysql',
                connection: 'connection string'
            }
        };
        var server = new Hapi.Server();
        server.register({register: Bookshelf,
            options: options},
            function (err) {
                expect(err).to.be.undefined();
                expect(server.plugins[Pkg.name]).to.be.an.object();
                done();
            });
    });

    it('registers bookshelf w/ mysql connection objects', function (done) {
        var options = {
            knex: {
                client: 'mysql',
                connection: {}
            }
        };
        var server = new Hapi.Server();
        server.register({register: Bookshelf,
            options: options},
            function (err) {
                expect(err).to.be.undefined();
                done();
            });
    });

    it('throws on bogus options.knex.connection', function (done) {
        var options = {
            knex: {
                client: 'mysql'
            }
        };
        var server = new Hapi.Server();
        expect(function () {
            server.register({register: Bookshelf,
                options: options},
                function () {});
        }).to.throw(/Invalid options .+/);
        done();
    });

    it('registers bookshelf plugins', function (done) {
        var server = new Hapi.Server();
        server.register({register: Bookshelf,
            options: optionsSqlite3WithModel},
            function (err) {
                expect(err).to.be.undefined();
                expect(server.plugins[Pkg.name]).to.be.an.object();
                done();
            });
    });

    it('throws on bogus options.plugins', function (done) {
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
        expect(function () {
            server.register({register: Bookshelf,
                options: options},
                function () {});
        }).to.throw(/Invalid plugin .+/);
        done();
    });

    it('loads models', function (done) {
        var server = new Hapi.Server();
        server.register({register: Bookshelf,
            options: optionsSqlite3WithModel},
            function (err) {
                expect(err).to.be.undefined();
                expect(getPlugin(server)).to.be.an.object();
                expect(getPlugin(server).model('Simple')).to.be.a.function();
                done();
            });
    });

    it('throws on bogus options.models', function (done) {
        var server = new Hapi.Server();
        expect(function () {
            server.register({register: Bookshelf,
                options: R.mixin(optionsSqlite3WithModel, {models: [123]})},
                function () {});
        }).to.throw(/Invalid model path .+/);
        done();
    });

    it('implements Model.parse()', function (done) {
        var server = new Hapi.Server();
        server.register({register: Bookshelf,
            options: optionsSqlite3WithModel},
            function (err) {
                /* eslint-disable */
                expect(getPlugin(server).model('Simple').forge()
                .parse({foo_bar: 1})).to.include('fooBar');
                /* eslint-enable */
                done();
            });
    });

    it('implements Model.format()', function (done) {
        var server = new Hapi.Server();
        server.register({register: Bookshelf,
            options: optionsSqlite3WithModel},
            function (err) {
                expect(getPlugin(server).model('Simple').forge()
                .format({fooBar: 1})).to.include('foo_bar');
                done();
            });
    });
});

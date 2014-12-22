'use strict';

// Load modules

var Path = require('path');
var Hapi = require('hapi');
var Code = require('code');
var Lab = require('lab');
var Bookshelf = require('..');

// Declare internals

var internals = {};

// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;


describe('register()', function () {

    var server = {expose: function () {}};

    it('registers bookshelf w/ sqlite3', function (done) {
        var options = {
            knex: {
                client: 'sqlite3',
                connection: {
                    filename: './db.sqlite'
                }
            }
        };
        Bookshelf.register(server, options, function (err) {
            expect(err).to.be.undefined();
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
        Bookshelf.register(server, options, function (err) {
            expect(err).to.be.undefined();
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
        Bookshelf.register(server, options, function (err) {
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
        expect(function () {
            Bookshelf.register(server, options, function () {});
        }).to.throw(/Invalid options .+/);
        done();
    });

    it('registers bookshelf plugins', function (done) {
        var options = {
            knex: {
                client: 'sqlite3',
                connection: {
                    filename: './db.sqlite'
                }
            },
            plugins: ['registry']
        };
        Bookshelf.register(server, options, function (err) {
            expect(err).to.be.undefined();
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
        expect(function () {
            Bookshelf.register(server, options, function () {});
        }).to.throw(/Invalid plugin .+/);
        done();
    });

    it('loads models', function (done) {
        var options = {
            knex: {
                client: 'sqlite3',
                connection: {
                    filename: './db.sqlite'
                }
            },
            models: [Path.join(__dirname, './models/simple')]
        };
        Bookshelf.register(server, options, function (err) {
            expect(err).to.be.undefined();
            done();
        });
    });

    it('throws on bogus options.models', function (done) {
        var options = {
            knex: {
                client: 'sqlite3',
                connection: {
                    filename: './db.sqlite'
                }
            },
            models: [123]
        };
        expect(function () {
            Bookshelf.register(server, options, function () {});
        }).to.throw(/Invalid model path .+/);
        done();
    });
});

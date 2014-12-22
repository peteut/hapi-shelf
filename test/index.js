'use strict';

// Load modules

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
            client: 'sqlite3',
            connection: {
                filename: './db.sqlite'
            }
        };

        Bookshelf.register(server, options, function (err) {
            expect(err).to.be.undefined();
            done();
        });
    });

    it('registers bookshelf w/ mysql connection string', function (done) {

        var options = {
            client: 'mysql',
            connection: 'connection string'
        };

        Bookshelf.register(server, options, function (err) {
            expect(err).to.be.undefined();
            done();
        });
    });

    it('registers bookshelf w/ mysql connection objects', function (done) {

        var options = {
            client: 'mysql',
            connection: {}
        };

        Bookshelf.register(server, options, function (err) {
            expect(err).to.be.undefined();
            done();
        });
    });

    it('throws on bogus options.connection', function (done) {

        var options = {
            client: 'mysql',
        };

        expect(function () {
            Bookshelf.register(server, options, function (err) {});
        }).to.throw(/Invalid options .+/);
        done();
    });

});



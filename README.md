# hapi-shelf

[![Build Status](https://travis-ci.org/peteut/hapi-bookshelf.svg)](
https://travis-ci.org/peteut/hapi-bookshelf)
[![Dependencies](https://david-dm.org/peteut/hapi-bookshelf.svg)](
https://david-dm.org/peteut/hapi-bookshelf)
[![devDependencies](https://david-dm.org/peteut/hapi-bookshelf/dev-status.svg)](
https://david-dm.org/peteut/hapi-bookshelf)
[![Coverage Status](https://img.shields.io/coveralls/peteut/hapi-bookshelf.svg)](
https://coveralls.io/r/peteut/hapi-bookshelf?branch=master)
[![Build Status (private)](https://oberon.unibe.ch:443/jenkins/job/hapi-bookshelf/badge/icon)](
https://oberon.unibe.ch:443/jenkins/job/hapi-bookshelf/)

**hapi-shelf** is a [Hapi](http://hapijs.com) plugin for [Bookshelf.js](
http://bookshelfjs.org), an ORM for RDBMS.

## Usage

Install **hapi-shelf** into your hapi project folder:

```bash
npm install hapi-shelf --save
```

Register the plugin with the server:

```javascript
var Hapi = require('hapi');
var HapiShelf = require('hapi-shelf');

var server = Hapi.Server();
server.register({
	register: HapiShelf,
	options: {
		// Knex connection, refer to http://knexjs.org
		knex: {
			client: 'mysql'
			connection: {
				host: '127.0.0.1',
				user: 'db_user',
				password: 'db_secret',
				database: 'db_name'
				}
			},
		// Bookshelf Plugins.
		plugins: ['registry'],
		// Register models w/ Bookshelf.
		models: [Path.join(__dirname, './models/user')],
		}
	},
	function (err) {
		if (err) {
			// Cannot proceed from here.
			throw err;
		}
		// Bookshelf instance is now available at server.plugins['hapi-shelf'].
	});
```

## Options

* `knex` - (required) the [knex](http://knexjs.org) configuration object.
* `plugins` - an optional array of strings. Defaults to `['registry']`.
* `models` - an optional array of model strings.

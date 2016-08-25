# hapi-shelf

[![Build Status](https://travis-ci.org/peteut/hapi-shelf.svg)](
https://travis-ci.org/peteut/hapi-shelf)
[![Dependency Status](https://david-dm.org/peteut/hapi-shelf.svg)](
https://david-dm.org/peteut/hapi-shelf)
[![devDependency Status](https://david-dm.org/peteut/hapi-shelf/dev-status.svg)](
https://david-dm.org/peteut/hapi-shelf#info=devDependencies)
[![npm version](https://badge.fury.io/js/hapi-shelf.svg)](
http://badge.fury.io/js/hapi-shelf)

**hapi-shelf** is a [Hapi](http://hapijs.com) plugin for [Bookshelf.js](
http://bookshelfjs.org), an ORM for RDBMS.

## Usage

Install **hapi-shelf** into your hapi project folder:

```bash
npm install hapi-shelf --save
```

Register the plugin with the server:

```javascript
'use strict';

const Hapi = require('hapi');
const HapiShelf = require('hapi-shelf');

const server = new Hapi.Server();

server.register(
    {
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
            pool: {
                min: 2,
                max: 10
            },
            acquireConnectionTimeout: 10000,
            // Bookshelf Plugins
            plugins: ['registry'],
            // Register models w/ Bookshelf
            // If models are in the root of your app, if they are inside a directory
            // deeper, make sure to include the link to there. `./src/models/user`, for example
            models: ['./models/user'],
        }
    },
    (err) => {

        if (err) {
            // Cannot proceed from here.
            throw err;
        }
        // Bookshelf instance is now available at server.plugins['hapi-shelf']
    }
);
```

## Options

* `knex` - (required) the [knex](http://knexjs.org) configuration object.
* `plugins` - an optional array of strings. Defaults to `['registry']`.
* `models` - an optional array of model strings.

## Models

Models are registered automatically upon plugin registration if defined
in `options.models`, using relative paths.
Models are defined as follows.

```javascript
'use strict';

module.exports = (bookshelf) => {

    const MyModel = bookshelf.Model.extend({
        tableName: 'my_model'
    });

    return bookshelf.model('MyModel', MyModel);
};
```

# Access this model in your route

```javascript
'use strict';

const MyModel = server.plugins['hapi-shelf'].model('MyModel');

server.route([
    {
        method: 'GET',
        path: '/projects',
        config: {
            handler: (request, reply) => {

                MyModel.fetchAll().then((models) => {

                    reply(models);
                });
            }
        }
    }
]);
```

Attributes are exposed as `camelCase`, and saved to the DB as `under_score`.

For details refer to [Bookshelf Models](http://bookshelfjs.org/#Model).

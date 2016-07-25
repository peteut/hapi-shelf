'use strict';

module.exports = function (bookshelf) {

    const Simple = bookshelf.Model.extend({
            tableName: 'table'
    });

    return bookshelf.model('Simple', Simple);
};

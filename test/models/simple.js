'use strict';

module.exports = function (bookshelf) {
    var Simple = bookshelf.Model.extend({
            tableName: 'table'
    });

    return bookshelf.model('Simple', Simple);
};

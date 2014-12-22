'use strict';

var getSimple = function (bookshelf) {
    var simple = bookshelf.Model.extend({
            tableName: 'table'
    });
};

module.exports = getSimple;

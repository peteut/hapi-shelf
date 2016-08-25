'use strict';

module.exports = (bookshelf) => {

    const Simple = bookshelf.Model.extend({ tableName: 'table' });

    return bookshelf.model('Simple', Simple);
};

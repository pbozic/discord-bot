'use strict';

const connection = require('./knexfile');
const Knex = require('knex')(connection);
const Bookshelf = require('bookshelf')(Knex);

// Custom plugins.
Bookshelf.plugin(require('bookshelf-eloquent'));

module.exports = Bookshelf;
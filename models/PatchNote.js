'use strict';

const Bookshelf = require('../bookshelf');


module.exports = Bookshelf.model('PatchNote', {
	tableName: 'patch_notes',
	hasTimestamps: ['created_at', 'updated_at'],
	hidden: [
		'deleted_at',
	],
	softDelete: true,
});
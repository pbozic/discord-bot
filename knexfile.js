'use strict';

const path = require('path');

// Load .env configuration.
require('dotenv').config();

module.exports = {
	client: 'sqlite3',
	connection: {
        filename: "./data/database.sqlite"
    },
	pool: {
		min: 2,
		max: 10,
	},
	migrations: {
		directory: path.resolve(__dirname, './migrations'),
		tableName: 'migrations',
	},
	debug: process.env.KNEX_DEBUG === 'true',
	log: {
		// eslint-disable-next-line no-empty-function
		warn() { }, // NOTE: Do not log warning messages.
	},
};
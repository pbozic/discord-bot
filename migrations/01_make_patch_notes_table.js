'use strict';

exports.up = async function(knex) {
	await knex.schema.createTable('patch_notes', (table) => {
		// Primary key.
		table.increments('id').unsigned().primary();

		// Info.
		table.string('title').unique();
		table.string('link').unique();
		table.string('description');
		table.timestamp('article_date').notNullable().index();
		// Timestamps.
		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now()).index();
		table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now()).index();
		table.timestamp('deleted_at').nullable().index(); // Soft delete (used for keeping history).
	});
};

exports.down = async function(knex) {
	await knex.schema.dropTable('patch_notes');
};
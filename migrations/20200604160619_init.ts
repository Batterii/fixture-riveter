import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('users', (table) => {
		table.increments('id');
		table.string('name');
		table.integer('age');
		table.timestamps();
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('users');
}

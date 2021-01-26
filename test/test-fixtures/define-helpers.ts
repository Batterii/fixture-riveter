import {Model} from "./model";
import {Model as ObjectionModel} from "objection";

const knex = ObjectionModel.knex();

export async function createTable(
	M: typeof Model,
	id = true,
): Promise<any> {
	const instance = new M();
	const {props} = instance;

	await knex.schema.dropTableIfExists(M.tableName);

	await knex.schema.createTable(M.tableName, (table) => {
		if (id) {
			table.increments("id");
		}
		for (const [columnName, type] of Object.entries(props as Record<string, string>)) {
			table[type](columnName);
		}
	});
}

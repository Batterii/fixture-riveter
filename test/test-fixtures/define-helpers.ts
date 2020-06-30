import {Model as ObjectionModel} from "objection";

const knex = ObjectionModel.knex();

type ColumnType = (
	"integer" | "bigInteger" | "text" | "string" | "float" | "decimal" | "boolean" | "date" |
	"datetime" | "time" | "timestamp" | "timestamps" | "dropTimestamps" | "binary" | "enu" |
	"json" | "jsonb" | "uuid"
);

const classes = {};

function defineClass(name: string) {
	classes[name] = class extends ObjectionModel {
		static tableName = name.toLowerCase();
	};
	return classes[name];
}

export async function createTable(Model: any, props: Record<string, ColumnType>): Promise<any> {
	await knex.schema.dropTableIfExists(Model.tableName);

	await knex.schema.createTable(Model.tableName, (table) => {
		table.increments("id");
		for (const [columnName, type] of Object.entries(props)) {
			table[type](columnName);
		}
	});
}

export async function defineModel(name: string, props: Record<string, ColumnType>): Promise<any> {
	const Model = defineClass(name);
	await createTable(Model, props);
	return Model;
}

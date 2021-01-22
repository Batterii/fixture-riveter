import {Model} from "./model";
import {Model as ObjectionModel} from "objection";

const knex = ObjectionModel.knex();

type ColumnType = (
	"integer" | "bigInteger" | "text" | "string" | "float" | "decimal" | "boolean" | "date" |
	"datetime" | "time" | "timestamp" | "timestamps" | "dropTimestamps" | "binary" | "enu" |
	"json" | "jsonb" | "uuid"
);

export async function createTable(
	M: typeof Model,
	propsArg?: Record<string, ColumnType>,
): Promise<any> {
	let props: Record<string, string>;
	if (propsArg) {
		props = propsArg;
	} else {
		const instance = new M();
		({props} = instance);
	}

	await knex.schema.dropTableIfExists(M.tableName);

	await knex.schema.createTable(M.tableName, (table) => {
		table.increments("id");
		for (const [columnName, type] of Object.entries(props)) {
			table[type](columnName);
		}
	});
}

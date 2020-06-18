import {Model} from "objection";

export class User extends Model {
	static tableName = "users";

	id: string;
	name: string;
	age: number;
}

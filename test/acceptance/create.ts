import {Model} from "../test-fixtures/model";
import {createTable} from "../test-fixtures/define-helpers";
import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";

describe("#create", function() {
	let fr: FixtureRiveter;

	class User extends Model {
		static tableName = "users";
		id: number;
		name: string;
		age: number;
		email: string;

		get props() {
			return {
				name: "string",
				age: "integer",
				email: "string",
			};
		}
	}

	before(async function() {
		await createTable(User);

		fr = new FixtureRiveter();
		fr.setAdapter(new ObjectionAdapter());

		fr.fixture("user", User, (f) => {
			f.attr("name", () => "Noah");
			f.attr("age", () => 32);
			f.sequence("email", (n) => `test${n}@foo.bar`);
		});
	});

	it("inserts into the database", async function() {
		const user = await fr.create("user", {name: "Bogart"});

		expect(user.id).to.exist;
		expect(user.name).to.equal("Bogart");
		expect(user.email).to.equal("test1@foo.bar");
		expect(user).to.be.an.instanceof(User);

		const model = await User.query().findById(user.id);
		expect(model.id).to.equal(user.id);
	});
});

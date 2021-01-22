import {Model} from "../test-fixtures/model";
import {createTable} from "../test-fixtures/define-helpers";
import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";

describe("method missing functionality", function() {
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
			f.name(() => "Noah");
			f.age(() => 32);
			f.email(async(e) => `${await e.name()}@example.com`);
		});
	});

	it("handles using methodMissing", async function() {
		const user = await fr.create("user");

		expect(user.id).to.exist;
		expect(user.name).to.equal("Noah");
		expect(user.email).to.equal("Noah@example.com");
		expect(user).to.be.an.instanceof(User);
	});
});

import {defineModel} from "../test-fixtures/define-helpers";
import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";

describe("#clean-up", function() {
	let fr: FixtureRiveter;
	let User: any;

	before(async function() {
		User = await defineModel("User", {
			name: "string",
			age: "integer",
			email: "string",
		});

		fr = new FixtureRiveter();
		fr.setAdapter(new ObjectionAdapter());

		fr.fixture("user", User, (f) => {
			f.attr("name", () => "Noah");
			f.attr("age", () => 32);
			f.sequence("email", (n) => `test${n}@foo.bar`);
		});
	});

	it("inserts into the database", async function() {
		await fr.createList("user", 5);
		expect(fr.instances).to.have.length(5);
		expect(await User.query()).to.have.length(5);

		await fr.cleanUp();
		expect(fr.instances).to.have.length(0);
		expect(await User.query()).to.have.length(0);
	});
});

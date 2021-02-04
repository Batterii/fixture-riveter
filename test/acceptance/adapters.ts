import {DefaultAdapter} from "../../lib/adapters/default-adapter";
import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FixtureRiveter} from "../../lib/fixture-riveter";
import {DummyModel} from "../support/dummy-model";

import {expect} from "chai";

describe("Adapter functionality", function() {
	let fr: FixtureRiveter;

	before(async function() {
		fr = new FixtureRiveter();
		fr.setAdapter(new ObjectionAdapter());
		fr.setAdapter(new DefaultAdapter(), "user");

		fr.fixture("user", DummyModel, (f) => {
			f.attr("name", () => "Noah");
			f.attr("age", () => 32);
			f.sequence("email", (n) => `test${n}@foo.bar`);
		});
	});

	specify("no error is thrown as DefaultAdapter is used", async function() {
		const user = await fr.create("user");
		expect(user).to.be.an.instanceof(DummyModel);
	});
});

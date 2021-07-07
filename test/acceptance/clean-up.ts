// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Model} from "../support/model";
import {createTable} from "../support/define-helpers";
import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";

describe("#clean-up", function() {
	let fr: FixtureRiveter;

	class User extends Model {
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
		await fr.createList("user", 5);
		expect(fr.instances).to.have.length(5);
		expect(await User.query()).to.have.length(5);

		await fr.cleanUp();
		expect(fr.instances).to.have.length(0);
		expect(await User.query()).to.have.length(0);
	});

	it("only calls delete on saved fixtures", async function() {
		await fr.attributesFor("user");
		await fr.build("user");
		await fr.create("user");

		expect(fr.instances).to.have.length(3);

		await fr.cleanUp();
		expect(fr.instances).to.have.length(0);
		expect(await User.query()).to.have.length(0);
	});
});

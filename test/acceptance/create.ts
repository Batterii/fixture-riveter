// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Model} from "../support/model";
import {createTable} from "../support/define-helpers";
import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";

describe("#create", function() {
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
		const user = await fr.create("user", {name: "Bogart"});

		expect(user.id).to.exist;
		expect(user.name).to.equal("Bogart");
		expect(user.email).to.equal("test1@foo.bar");
		expect(user).to.be.an.instanceof(User);

		const model = await User.query().findById(user.id);
		expect(model.id).to.equal(user.id);
	});
});

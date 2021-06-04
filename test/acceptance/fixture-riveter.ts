// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {DummyModel} from "../support/dummy-model";
import {Model} from "../support/model";
import {createTable} from "../support/define-helpers";
import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";

describe("FixtureRiveter", function() {
	describe("nameGuard variations", function() {
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

		specify("strings", async function() {
			await createTable(User);

			fr = new FixtureRiveter();
			fr.setAdapter(new ObjectionAdapter());

			fr.fixture("user", User, (f) => {
				f.attr("name", () => "Noah");
				f.attr("age", () => 32);
			});

			const user = await fr.create<User>("user", {name: "Bogart"});

			expect(user.name).to.equal("Bogart");
			expect(user.age).to.equal(32);
			expect(user).to.be.an.instanceof(User);
		});

		specify("Objection Models", async function() {
			await createTable(User);

			fr = new FixtureRiveter();
			fr.setAdapter(new ObjectionAdapter());

			fr.fixture(User, (f) => {
				f.attr("name", () => "Noah");
				f.attr("age", () => 32);
			});

			const user = await fr.create(User, {name: "Bogart"});

			expect(user.name).to.equal("Bogart");
			expect(user.age).to.equal(32);
			expect(user).to.be.an.instanceof(User);
		});

		specify("normal classes", async function() {
			fr = new FixtureRiveter();

			fr.fixture(DummyModel, (f) => {
				f.attr("name", () => "Noah");
				f.attr("age", () => 32);
			});

			const user = await fr.create(DummyModel, {name: "Bogart"});

			expect(user.name).to.equal("Bogart");
			expect(user.age).to.equal(32);
			expect(user).to.be.an.instanceof(DummyModel);
		});
	});
});

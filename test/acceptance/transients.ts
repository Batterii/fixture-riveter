// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Model} from "../support/model";
import {createTable} from "../support/define-helpers";
import {FixtureRiveter} from "../../lib/fixture-riveter";
import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";

import {expect} from "chai";

describe("transient attributes", function() {
	let fr: FixtureRiveter;

	class User extends Model {
		name: string;
		email: string;

		get props() {
			return {
				name: "string",
				email: "string",
			};
		}
	}

	before(async function() {
		await createTable(User);

		fr = new FixtureRiveter();
		fr.setAdapter(new ObjectionAdapter());

		fr.sequence("name", (n) => `Noah ${n}`);

		fr.fixture("user", User, (f) => {
			f.transient((t) => {
				t.attr("four", () => 2 + 2);
				t.attr("rockstar", () => true);
				t.attr("upcased", () => false);
			});

			f.attr("name", async(a) => {
				let rockstar = "";
				if (await a.attr("rockstar")) {
					rockstar = " - Rockstar";
				}
				return `${fr.generate("name")}${rockstar}`;
			});

			f.attr("email", async(a) => {
				const name = await a.attr("name");
				const four = await a.attr("four");
				return `${name.toLowerCase()}${four}@example.com`;
			});

			f.after("create", async(user, evaluator) => {
				if (await evaluator.attr("upcased")) {
					user.name = user.name.toUpperCase();
				}
			});
		});
	});

	beforeEach(function() {
		fr.resetSequences();
	});

	context("returning attributes from a fixture", function() {
		it("doesn't have any transient attributes", async function() {
			const user = await fr.attributesFor("user", {rockstar: true});

			expect(user).to.haveOwnProperty("name");
			expect(user).to.haveOwnProperty("email");
			expect(user).to.not.haveOwnProperty("four");
			expect(user).to.not.haveOwnProperty("rockstar");
			expect(user).to.not.haveOwnProperty("upcased");
		});
	});

	context("with a transint variable assigned", function() {
		it("generates the correct attibutes on a rockstar", async function() {
			const rockstar = await fr.create("user", {rockstar: true, four: "1234"});
			expect(rockstar.name).to.equal("Noah 1 - Rockstar");
			expect(rockstar.email).to.equal("noah 1 - rockstar1234@example.com");
		});

		it("generates the correct attributes on an uppercased rockstar", async function() {
			const upperCasedRockstar = await fr.create("user", {rockstar: true, upcased: true});
			expect(upperCasedRockstar.name).to.equal("NOAH 1 - ROCKSTAR");
			expect(upperCasedRockstar.email).to.equal("noah 1 - rockstar4@example.com");
		});

		it("generates the correct attributes on a rockstar with a name", async function() {
			const rockstarWithName = await fr.create("user", {name: "Jane Doe", rockstar: true});
			expect(rockstarWithName.name).to.equal("Jane Doe");
			expect(rockstarWithName.email).to.equal("jane doe4@example.com");
		});

		it("generates the correct attributes on a groupie", async function() {
			const groupie = await fr.create("user", {rockstar: false});
			expect(groupie.name).to.equal("Noah 1");
			expect(groupie.email).to.equal("noah 14@example.com");
		});
	});

	context("without transient variables assigned", function() {
		it("uses the default value of the attribute", async function() {
			const rockstar = await fr.create("user");
			expect(rockstar.name).to.equal("Noah 1 - Rockstar");
		});
	});
});

describe("transient sequences", function() {
	let fr: FixtureRiveter;
	class User extends Model {
		name: string;

		get props() {
			return {name: "string"};
		}
	}

	before(async function() {
		await createTable(User);

		fr = new FixtureRiveter();
		fr.setAdapter(new ObjectionAdapter());

		fr.fixture("user", User, (f) => {
			f.transient((t) => {
				t.sequence("counter");
			});

			f.attr("name", async(a) => `Noah ${await a.attr("counter")}`);
		});
	});

	it("increments correctly", async function() {
		const user1 = await fr.build("user");
		const user2 = await fr.build("user");

		expect(user1.name).to.equal("Noah 1");
		expect(user2.name).to.equal("Noah 2");
	});
});

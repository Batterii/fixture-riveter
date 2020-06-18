import {FactoryBuilder} from "../../lib/factory-builder";

import {expect} from "chai";

import {Model} from "objection";

class User extends Model {
	static tableName = "users";

	id: string;
	name: string;
	age: number;
	admin: boolean;
	gender: string;
	email: string;
	dateOfBirth: Date;
	great: string;
}

describe("Traits", function() {
	let fb: FactoryBuilder;

	beforeEach(function() {
		fb = new FactoryBuilder();

		fb.define(function() {
			fb.factory("user", User, (f: any) => {
				f.attr("name", () => "Noah");
				f.attr("age", () => 32);
				f.sequence("email", (n: number) => `test${n}@foo.bar`);

				f.trait("old", (t: any) => {
					t.attr("age", () => 100);
				});
			});
		});
	});

	it("can apply traits to a factory instance", async function() {
		const model = await fb.build("user", "old", {name: "Bogart"});
		expect(model.age).to.equal(100);
		expect(model.name).to.equal("Bogart");
	});
});

describe("tests from factory_bot", function() {
	let fb: FactoryBuilder;

	before(function() {
		fb = new FactoryBuilder();

		fb.define(function() {
			fb.factory("userWithoutAdminScoping", User, (f: any) => {
				f.attr("adminTrait");
			});

			fb.factory("user", User, (f: any) => {
				f.attr("name", () => "Noah");

				f.trait("great", (t: any) => {
					t.attr("great", () => "GREAT!!!");
				});

				f.trait("great", (t: any) => {
					t.attr("great", () => "EVEN GREATER!!!");
				});

				f.trait("admin", (t: any) => {
					t.attr("admin", () => true);
				});

				f.trait("adminTrait", (t: any) => {
					t.attr("admin", () => true);
				});

				f.trait("male", (t: any) => {
					t.attr("name", () => "Joe");
					t.attr("gender", () => "Male");
				});

				f.trait("female", (t: any) => {
					t.attr("name", () => "Jane");
					t.attr("gender", () => "Female");
				});

				f.factory("greatUser", User, (ff: any) => {
					ff.attr("great");
				});

				f.factory("evenGreaterUser", User, (ff: any) => {
					ff.attr("great");

					ff.trait("great", (t: any) => {
						t.attr("great", () => "EVEN GREATER!!!");
					});
				});

				f.factory("admin", {traits: ["admin"]});

				f.factory("maleUser", User, (ff: any) => {
					ff.attr("male");

					ff.factory("childMaleUser", User, (fff: any) => {
						fff.attr("dateOfBirth", () => new Date("1/1/2020"));
					});
				});

				f.factory("femaleUser", User, {traits: ["female"]}, (ff: any) => {
					ff.trait("admin", (t: any) => {
						t.attr("admin", () => true);
						t.attr("name", () => "Judy");
					});

					ff.factory("femaleGreatUser", User, (fff: any) => {
						fff.attr("great");
					});

					ff.factory("femaleAdminJudy", User, {traits: ["admin"]});
				});

				f.factory("femaleAdmin", User, {traits: ["female", "admin"]});
				f.factory("femaleAfterMaleAdmin", User, {traits: ["male", "female", "admin"]});
				f.factory("maleAfterFemaleAdmin", User, {traits: ["female", "male", "admin"]});
			});

			fb.trait("email", (t: any) => {
				t.attr("email", (a: any) => `${a.attr("name")}@example.com`);
			});

			fb.factory("userWithEmail", User, {traits: ["email"]}, (f: any) => {
				f.attr("name", () => "Bill");
			});
		});
	});
});

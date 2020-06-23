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
	describe("an instance generated by a factory with multiple traits", function() {
		let fb: FactoryBuilder;

		before(function() {
			fb = new FactoryBuilder();

			fb.define(function() {
				fb.factory("userWithoutAdminScoping", User, (f: any) => {
					f.attr("adminTrait");
				});

				fb.factory("user", User, (f: any) => {
					f.attr("name", () => "John");

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

					f.factory("admin", User, {traits: ["admin"]});

					f.factory("maleUser", User, (ff: any) => {
						ff.attr("male");

						ff.factory("childMaleUser", User, (fff: any) => {
							fff.attr("dateOfBirth", () => new Date("1/1/2020"));
						});
					});

					f.factory("female", User, {traits: ["female"]}, (ff: any) => {
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
					t.attr("email", async(e: any) => `${await e.attr("name")}@example.com`);
				});

				fb.factory("userWithEmail", User, {traits: ["email"]}, (f: any) => {
					f.attr("name", () => "Bill");
				});
			});
		});

		specify("the parent class", async function() {
			const user = await fb.build("user");
			expect(user.name).to.equal("John");
			expect(user.gender).to.not.exist;
			expect(user.admin).to.not.exist;
		});

		specify("the child class with one trait", async function() {
			const user = await fb.build("admin");
			expect(user.name).to.equal("John");
			expect(user.gender).to.not.exist;
			expect(user.admin).to.be.true;
		});

		specify("the other child class with one trait", async function() {
			const user = await fb.build("female");
			expect(user.name).to.equal("Jane");
			expect(user.gender).to.equal("Female");
			expect(user.admin).to.not.exist;
		});

		specify("the child with multiple traits", async function() {
			const user = await fb.build("femaleAdmin");
			expect(user.name).to.equal("Jane");
			expect(user.gender).to.equal("Female");
			expect(user.admin).to.be.true;
		});

		specify("the child with multiple traits and overridden attributes", async function() {
			const user = await fb.build("femaleAdmin", {name: "Jill", gender: undefined});
			expect(user.name).to.equal("Jill");
			expect(user.gender).to.not.exist;
			expect(user.admin).to.be.true;
		});

		context("the child with multiple traits who override the same attribute", function() {
			specify("when the male assigns name after female", async function() {
				const user = await fb.build("maleAfterFemaleAdmin");
				expect(user.name).to.equal("Joe");
				expect(user.gender).to.equal("Male");
				expect(user.admin).to.be.true;
			});

			specify("when the female assigns name after male", async function() {
				const user = await fb.build("femaleAfterMaleAdmin");
				expect(user.name).to.equal("Jane");
				expect(user.gender).to.equal("Female");
				expect(user.admin).to.be.true;
			});
		});

		specify("child class with scoped trait and inherited trait", async function() {
			const user = await fb.build("femaleAdminJudy");
			expect(user.name).to.equal("Judy");
			expect(user.gender).to.equal("Female");
			expect(user.admin).to.be.true;
		});

		specify("factory using global trait", async function() {
			const user = await fb.build("userWithEmail");
			expect(user.name).to.equal("Bill");
			expect(user.email).to.equal("Bill@example.com");
		});

		context("factory created with alternate syntax for specifying trait", function() {
			specify("creation works", async function() {
				const user = await fb.build("maleUser");
				expect(user.gender).to.equal("Male");
			});

			specify("where trait name and attribute are the same", async function() {
				const user = await fb.build("greatUser");
				expect(user.great).to.equal("GREAT!!!");
			});

			specify(
				"where trait name and attribute are the same and attribute is overridden",
				async function() {
					const user = await fb.build("greatUser", {great: "SORT OF!!!"});
					expect(user.great).to.equal("SORT OF!!!");
				},
			);
		});

		context("factory with trait defined multiple times", function() {
			specify("creation works", async function() {
				const user = await fb.build("greatUser");
				expect(user.great).to.equal("GREAT!!!");
			});

			specify("child factory redefining trait", async function() {
				const user = await fb.build("evenGreaterUser");
				expect(user.great).to.equal("EVEN GREATER!!!");
			});
		});

		specify("child factory created where trait attributes are inherited", async function() {
			const user = await fb.build("childMaleUser");
			expect(user.gender).to.equal("Male");
			expect(user.dateOfBirth).to.deep.equal(new Date("1/1/2020"));
		});

		specify("factory outside of scope", async function() {
			const fn = async() => fb.build("userWithoutAdminScoping");
			expect(fn).to.throw;
		});

		specify("child factory using grandparents' trait", async function() {
			const user = await fb.build("femaleGreatUser");
			expect(user.great).to.equal("GREAT!!!");
		});
	});

	describe("looking up traits that don't exist", function() {
		it("raises an error", async function() {
			const fb = new FactoryBuilder();

			fb.define(function() {
				fb.factory("user", User);
			});

			const fn = async() => fb.build("user", "missing trait");

			return expect(Promise.resolve(fn())).to.eventually.be.rejected;
		});
	});

	specify("traits and dynamic attributes that are applied simultaneously", async function() {
		const fb = new FactoryBuilder();

		fb.define(function() {
			fb.trait("email", (f: any) => {
				f.attr("email", async(e) => `${await e.attr("name")}@example.com`);
			});

			fb.factory("user", User, (f: any) => {
				f.attr("name", () => "John");
				f.attr("email");
				f.attr("combined", async(e) => {
					return `${await e.attr("name")} <${await e.attr("email")}>`;
				});
			});
		});

		const user = await fb.build("user");
		expect(user.name).to.equal("John");
		expect(user.email).to.equal("John@example.com");
		expect(user.combined).to.equal("John <John@example.com>");
	});

	describe("inline traits overriding existing attributes", function() {
		class Action extends Model {
			static tableName = "users";

			id: string;
			status: string;
		}
		let fb: FactoryBuilder;

		before(function() {
			fb = new FactoryBuilder();

			fb.define(function() {
				fb.factory("action", Action, (f) => {
					f.attr("status", () => "pending");

					f.trait("accepted", (t) => {
						t.attr("status", () => "accepted");
					});

					f.trait("declined", (t) => {
						t.attr("status", () => "declined");
					});

					f.factory("declinedAction", Action, {traits: ["declined"]});
					f.factory("extendedDeclinedAction", Action, {traits: ["declined"]}, (ff) => {
						ff.attr("status", () => "extended declined");
					});
				});
			});
		});

		it("returns the default status", async function() {
			const action = await fb.build("action");
			expect(action.status).to.equal("pending");
		});

		it("prefers inline trait attributes over default attributes", async function() {
			const action = await fb.build("action", "accepted");
			expect(action.status).to.equal("accepted");
		});

		it("prefers traits on a factory over default attributes", async function() {
			const action = await fb.build("declinedAction");
			expect(action.status).to.equal("declined");
		});

		it("prefers inline trait attributes over traits on a factory", async function() {
			const action = await fb.build("declinedAction", "accepted");
			expect(action.status).to.equal("accepted");
		});

		it(
			"prefers attributes on factories over attributes from non-inline traits",
			async function() {
				const action = await fb.build("extendedDeclinedAction");
				expect(action.status).to.equal("extended declined");
			},
		);

		it("prefers inline traits over attributes on factories", async function() {
			const action = await fb.build("extendedDeclinedAction", "accepted");
			expect(action.status).to.equal("accepted");
		});

		it(
			`prefers overridden attributes over attributes from traits,
			inline traits, or attributes on factories`,
			async function() {
				const action = await fb.build(
					"extendedDeclinedAction",
					"accepted",
					{status: "completely overriden"},
				);
				expect(action.status).to.equal("completely overriden");
			},
		);
	});
});

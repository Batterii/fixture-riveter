import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";

import {defineModel} from "../test-fixtures/define-helpers";

describe("Traits", function() {
	let fr: FixtureRiveter;
	let User: any;

	before(async function() {
		User = await defineModel("User", {
			name: "string",
			age: "integer",
			admin: "boolean",
			gender: "string",
			email: "string",
			dateOfBirth: "date",
			great: "string",
		});

		fr = new FixtureRiveter();

		fr.fixture("user", User, (f: any) => {
			f.attr("name", () => "Noah");
			f.attr("age", () => 32);
			f.sequence("email", (n: number) => `test${n}@foo.bar`);

			f.trait("old", (t: any) => {
				t.attr("age", () => 100);
			});
		});
	});

	it("can apply traits to a fixture instance", async function() {
		const model = await fr.build("user", "old", {name: "Bogart"});
		expect(model.age).to.equal(100);
		expect(model.name).to.equal("Bogart");
	});
});

describe("tests from fixture_bot", function() {
	let User: any;

	before(async function() {
		User = await defineModel("User", {
			name: "string",
			age: "integer",
			admin: "boolean",
			gender: "string",
			email: "string",
			dateOfBirth: "date",
			great: "string",
		});
	});

	describe("an instance generated by a fixture with multiple traits", function() {
		let fr: FixtureRiveter;

		before(async function() {
			fr = new FixtureRiveter();

			fr.fixture("userWithoutAdminScoping", User, (f: any) => {
				f.attr("adminTrait");
			});

			fr.fixture("user", User, (f: any) => {
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

				f.fixture("greatUser", User, (ff: any) => {
					ff.attr("great");
				});

				f.fixture("evenGreaterUser", User, (ff: any) => {
					ff.attr("great");

					ff.trait("great", (t: any) => {
						t.attr("great", () => "EVEN GREATER!!!");
					});
				});

				f.fixture("admin", User, {traits: ["admin"]});

				f.fixture("maleUser", User, (ff: any) => {
					ff.attr("male");

					ff.fixture("childMaleUser", User, (fff: any) => {
						fff.attr("dateOfBirth", () => new Date("1/1/2020"));
					});
				});

				f.fixture("female", User, {traits: ["female"]}, (ff: any) => {
					ff.trait("admin", (t: any) => {
						t.attr("admin", () => true);
						t.attr("name", () => "Judy");
					});

					ff.fixture("femaleGreatUser", User, (fff: any) => {
						fff.attr("great");
					});

					ff.fixture("femaleAdminJudy", User, {traits: ["admin"]});
				});

				f.fixture("femaleAdmin", User, {traits: ["female", "admin"]});
				f.fixture("femaleAfterMaleAdmin", User, {traits: ["male", "female", "admin"]});
				f.fixture("maleAfterFemaleAdmin", User, {traits: ["female", "male", "admin"]});
			});

			fr.trait("email", (t: any) => {
				t.attr("email", async(e: any) => `${await e.attr("name")}@example.com`);
			});

			fr.fixture("userWithEmail", User, {traits: ["email"]}, (f: any) => {
				f.attr("name", () => "Bill");
			});
		});

		specify("the parent class", async function() {
			const user = await fr.build("user");
			expect(user.name).to.equal("John");
			expect(user.gender).to.not.exist;
			expect(user.admin).to.not.exist;
		});

		specify("the child class with one trait", async function() {
			const user = await fr.build("admin");
			expect(user.name).to.equal("John");
			expect(user.gender).to.not.exist;
			expect(user.admin).to.be.true;
		});

		specify("the other child class with one trait", async function() {
			const user = await fr.build("female");
			expect(user.name).to.equal("Jane");
			expect(user.gender).to.equal("Female");
			expect(user.admin).to.not.exist;
		});

		specify("the child with multiple traits", async function() {
			const user = await fr.build("femaleAdmin");
			expect(user.name).to.equal("Jane");
			expect(user.gender).to.equal("Female");
			expect(user.admin).to.be.true;
		});

		specify("the child with multiple traits and overridden attributes", async function() {
			const user = await fr.build("femaleAdmin", {name: "Jill", gender: undefined});
			expect(user.name).to.equal("Jill");
			expect(user.gender).to.not.exist;
			expect(user.admin).to.be.true;
		});

		context("the child with multiple traits who override the same attribute", function() {
			specify("when the male assigns name after female", async function() {
				const user = await fr.build("maleAfterFemaleAdmin");
				expect(user.name).to.equal("Joe");
				expect(user.gender).to.equal("Male");
				expect(user.admin).to.be.true;
			});

			specify("when the female assigns name after male", async function() {
				const user = await fr.build("femaleAfterMaleAdmin");
				expect(user.name).to.equal("Jane");
				expect(user.gender).to.equal("Female");
				expect(user.admin).to.be.true;
			});
		});

		specify("child class with scoped trait and inherited trait", async function() {
			const user = await fr.build("femaleAdminJudy");
			expect(user.name).to.equal("Judy");
			expect(user.gender).to.equal("Female");
			expect(user.admin).to.be.true;
		});

		specify("fixture using global trait", async function() {
			const user = await fr.build("userWithEmail");
			expect(user.name).to.equal("Bill");
			expect(user.email).to.equal("Bill@example.com");
		});

		context("fixture created with alternate syntax for specifying trait", function() {
			specify("creation works", async function() {
				const user = await fr.build("maleUser");
				expect(user.gender).to.equal("Male");
			});

			specify("where trait name and attribute are the same", async function() {
				const user = await fr.build("greatUser");
				expect(user.great).to.equal("GREAT!!!");
			});

			specify(
				"where trait name and attribute are the same and attribute is overridden",
				async function() {
					const user = await fr.build("greatUser", {great: "SORT OF!!!"});
					expect(user.great).to.equal("SORT OF!!!");
				},
			);
		});

		context("fixture with trait defined multiple times", function() {
			specify("creation works", async function() {
				const user = await fr.build("greatUser");
				expect(user.great).to.equal("GREAT!!!");
			});

			specify("child fixture redefining trait", async function() {
				const user = await fr.build("evenGreaterUser");
				expect(user.great).to.equal("EVEN GREATER!!!");
			});
		});

		specify("child fixture created where trait attributes are inherited", async function() {
			const user = await fr.build("childMaleUser");
			expect(user.gender).to.equal("Male");
			expect(user.dateOfBirth).to.deep.equal(new Date("1/1/2020"));
		});

		specify("fixture outside of scope", async function() {
			const fn = async() => fr.build("userWithoutAdminScoping");
			expect(fn).to.throw;
		});

		specify("child fixture using grandparents' trait", async function() {
			const user = await fr.build("femaleGreatUser");
			expect(user.great).to.equal("GREAT!!!");
		});
	});

	describe("looking up traits that don't exist", function() {
		it("raises an error", async function() {
			const fr = new FixtureRiveter();

			fr.fixture("user", User);

			const fn = async() => fr.build("user", "missing trait");

			return expect(Promise.resolve(fn())).to.eventually.be.rejected;
		});
	});

	specify("traits and dynamic attributes that are applied simultaneously", async function() {
		const fr = new FixtureRiveter();

		fr.trait("email", (f: any) => {
			f.attr("email", async(e) => `${await e.attr("name")}@example.com`);
		});

		fr.fixture("user", User, (f: any) => {
			f.attr("name", () => "John");
			f.attr("email");
			f.attr("combined", async(e) => {
				return `${await e.attr("name")} <${await e.attr("email")}>`;
			});
		});

		const user = await fr.build("user");
		expect(user.name).to.equal("John");
		expect(user.email).to.equal("John@example.com");
		expect(user.combined).to.equal("John <John@example.com>");
	});

	describe("inline traits overriding existing attributes", function() {
		let Action: any;
		let fr: FixtureRiveter;

		before(async function() {
			Action = await defineModel("Action", {
				status: "string",
			});

			fr = new FixtureRiveter();

			fr.fixture("action", Action, (f) => {
				f.attr("status", () => "pending");

				f.trait("accepted", (t) => {
					t.attr("status", () => "accepted");
				});

				f.trait("declined", (t) => {
					t.attr("status", () => "declined");
				});

				f.fixture("declinedAction", Action, {traits: ["declined"]});
				f.fixture("extendedDeclinedAction", Action, {traits: ["declined"]}, (ff) => {
					ff.attr("status", () => "extended declined");
				});
			});
		});

		it("returns the default status", async function() {
			const action = await fr.build("action");
			expect(action.status).to.equal("pending");
		});

		it("prefers inline trait attributes over default attributes", async function() {
			const action = await fr.build("action", "accepted");
			expect(action.status).to.equal("accepted");
		});

		it("prefers traits on a fixture over default attributes", async function() {
			const action = await fr.build("declinedAction");
			expect(action.status).to.equal("declined");
		});

		it("prefers inline trait attributes over traits on a fixture", async function() {
			const action = await fr.build("declinedAction", "accepted");
			expect(action.status).to.equal("accepted");
		});

		it(
			"prefers attributes on factories over attributes from non-inline traits",
			async function() {
				const action = await fr.build("extendedDeclinedAction");
				expect(action.status).to.equal("extended declined");
			},
		);

		it("prefers inline traits over attributes on factories", async function() {
			const action = await fr.build("extendedDeclinedAction", "accepted");
			expect(action.status).to.equal("accepted");
		});

		it(
			`prefers overridden attributes over attributes from traits,
			inline traits, or attributes on factories`,
			async function() {
				const action = await fr.build(
					"extendedDeclinedAction",
					"accepted",
					{status: "completely overriden"},
				);
				expect(action.status).to.equal("completely overriden");
			},
		);
	});

	describe("making sure the fixture is compiled the first time we instantiate it", function() {
		let fr: FixtureRiveter;

		before(async function() {
			User = await defineModel("User", {
				role: "string",
				gender: "string",
				age: "integer",
			});

			fr = new FixtureRiveter();

			fr.fixture("user", User, (f: any) => {
				f.trait("female", (t) => t.attr("gender", () => "female"));
				f.trait("admin", (t) => t.attr("role", () => "admin"));

				f.fixture("femaleUser", User, (ff) => {
					ff.attr("female");
				});
			});
		});

		it("can honor traits on the very first call", async function() {
			const user = await fr.build("femaleUser", "admin", {age: 30});
			expect(user.gender).to.equal("female");
			expect(user.age).to.equal(30);
			expect(user.role).to.equal("admin");

			const user1 = await fr.build("femaleUser", {age: 30});
			expect(user1.gender).to.equal("female");
			expect(user1.age).to.equal(30);
			expect(user1.role).to.be.undefined;

			const user2 = await fr.build("femaleUser");
			expect(user2.gender).to.equal("female");
			expect(user2.age).to.be.undefined;
			expect(user2.role).to.be.undefined;
		});
	});
});
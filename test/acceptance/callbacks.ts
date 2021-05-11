import {Model} from "../support/model";
import {createTable} from "../support/define-helpers";

import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";

describe("Callbacks", function() {
	let fr: FixtureRiveter;

	class User extends Model {
		id: number;
		name: string;
		age: number;

		get props() {
			return {
				name: "string",
				age: "integer",
			};
		}
	}

	before(async function() {
		await createTable(User);

		fr = new FixtureRiveter();
		fr.setAdapter(new ObjectionAdapter());

		fr.fixture("userWithCallbacks", User, (f) => {
			f.attr("name", () => "Noah");
			f.attr("age", () => 32);

			f.after("build", (user) => {
				user.name = "Buildy";
			});
			f.after("create", (user) => {
				user.age = 100;
			});
		});

		fr.fixture("userWithInheritedCallbacks", User, {parent: "userWithCallbacks"}, (f) => {
			f.after("build", (user) => {
				user.name = "Child-Buildy";
			});
		});
	});

	it("runs the after('build') callback when building", async function() {
		const user = await fr.build("userWithCallbacks");
		expect(user.name).to.equal("Buildy");
	});

	it("runs both after('build') and after('create') callbacks when creating", async function() {
		const user = await fr.create("userWithCallbacks");
		expect(user.name).to.equal("Buildy");
		expect(user.age).to.equal(100);
	});

	it("runs child callback after parent callback", async function() {
		const user = await fr.build("userWithInheritedCallbacks");
		expect(user.name).to.equal("Child-Buildy");
	});
});

describe("binding a callback to multiple callbacks", function() {
	let fr: FixtureRiveter;
	let counter: number;

	class User extends Model {
		id: number;
		name: string;
		age: number;

		get props() {
			return {
				name: "string",
				age: "integer",
			};
		}
	}

	beforeEach(async function() {
		await createTable(User);

		counter = 0;

		fr = new FixtureRiveter();
		fr.setAdapter(new ObjectionAdapter());

		fr.fixture("user", User, (f) => {
			f.attr("name", () => "Noah");
			f.attr("age", () => 32);

			f.after("build", "create", (user) => {
				user.name = user.name.toUpperCase();
				counter += 1;
			});
		});
	});

	it("binds the callback to building", async function() {
		const user = await fr.build("user");
		expect(user.name).to.equal("NOAH");
		expect(counter).to.equal(1);
	});

	it("binds the callback to creation", async function() {
		const user = await fr.create("user");
		expect(user.name).to.equal("NOAH");
		expect(counter).to.equal(2);
	});
});

describe("global callbacks", function() {
	let fr: FixtureRiveter;

	class User extends Model {
		id: number;
		name: string;
		age: number;

		get props() {
			return {
				name: "string",
				age: "integer",
			};
		}
	}

	class Company extends Model {
		id: number;
		name: string;
		type: string;

		get props() {
			return {
				name: "string",
				type: "string",
			};
		}
	}

	before(async function() {
		await createTable(User);
		await createTable(Company);

		fr = new FixtureRiveter();
		fr.setAdapter(new ObjectionAdapter());

		fr.after("build", (object: any) => {
			if (object.constructor.tableName === Company.tableName) {
				object.name = "Acme Suppliers";
			} else {
				object.name = "John Doe";
			}
		});

		fr.after("create", (object: any) => {
			object.name = `${object.name}!!!`;
		});

		fr.trait("awesome", (t) => {
			t.after("build", (object: any) => {
				object.name = `___${object.name}___`;
			});

			t.after("create", (object: any) => {
				object.name = `A${object.name}Z`;
			});
		});

		fr.fixture("user", User, (f) => {
			f.after("build", (user) => {
				user.name = user.name.toLowerCase();
			});

			f.fixture("child user", (ff) => {
				ff.after("build", (user) => {
					user.name = `childlike: ${user.name}`;
				});
			});
		});

		fr.fixture("company", Company, (f) => {
			f.after("build", (company) => {
				company.name = company.name.toUpperCase();
			});
		});
	});

	it("triggers after build callbacks for all factories", async function() {
		let user = await fr.build("user");
		expect(user.name).to.equal("john doe");
		user = await fr.create("user");
		expect(user.name).to.equal("john doe!!!");
		user = await fr.create("user", ["awesome"]);
		expect(user.name).to.equal("A___john doe___!!!Z");
		const company = await fr.build("company");
		expect(company.name).to.equal("ACME SUPPLIERS");

		const childUser = await fr.build("child user");
		expect(childUser.name).to.equal("childlike: john doe");
	});
});

import {User} from "../test-fixtures/user";

import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FactoryBuilder} from "../../lib/factory-builder";

import {expect} from "chai";
import {Model} from "objection";

describe("Callbacks", function() {
	let fb: FactoryBuilder;

	before(function() {
		fb = new FactoryBuilder();
		fb.setAdapter(new ObjectionAdapter());

		fb.factory("userWithCallbacks", User, (f) => {
			f.attr("name", () => "Noah");
			f.attr("age", () => 32);

			f.after("build", (user) => {
				user.name = "Buildy";
			});
			f.after("create", (user) => {
				user.age = 100;
			});
		});

		fb.factory("userWithInheritedCallbacks", User, {parent: "userWithCallbacks"}, (f) => {
			f.after("build", (user) => {
				user.name = "Child-Buildy";
			});
		});
	});

	it("runs the after('build') callback when building", async function() {
		const user = await fb.build("userWithCallbacks");
		expect(user.name).to.equal("Buildy");
	});

	it("runs both after('build') and after('create') callbacks when creating", async function() {
		const user = await fb.create("userWithCallbacks");
		expect(user.name).to.equal("Buildy");
		expect(user.age).to.equal(100);
	});

	it("runs child callback after parent callback", async function() {
		const user = await fb.build("userWithInheritedCallbacks");
		expect(user.name).to.equal("Child-Buildy");
	});
});

describe("binding a callback to multiple callbacks", function() {
	let fb: FactoryBuilder;
	let counter: number;

	beforeEach(function() {
		counter = 0;

		fb = new FactoryBuilder();
		fb.setAdapter(new ObjectionAdapter());

		fb.factory("user", User, (f) => {
			f.attr("name", () => "Noah");
			f.attr("age", () => 32);

			f.after("build", "create", (user) => {
				user.name = user.name.toUpperCase();
				counter += 1;
			});
		});
	});

	it("binds the callback to building", async function() {
		const user = await fb.build("user");
		expect(user.name).to.equal("NOAH");
		expect(counter).to.equal(1);
	});

	it("binds the callback to creation", async function() {
		const user = await fb.create("user");
		expect(user.name).to.equal("NOAH");
		expect(counter).to.equal(2);
	});
});

class Company extends Model {
	static tableName = "companies";

	id: string;
	name: string;
	type: string;
}

describe("global callbacks", function() {
	let fb: FactoryBuilder;

	beforeEach(function() {
		fb = new FactoryBuilder();
		fb.setAdapter(new ObjectionAdapter());

		fb.after("build", (object) => {
			if (object.type) {
				object.name = "Acme Suppliers";
			} else {
				object.name = "John Doe";
			}
		});

		fb.after("create", (object) => {
			object.name = `${object.name}!!!`;
		});

		fb.trait("awesome", (t) => {
			t.after("build", (object) => {
				object.name = `___${object.name}___`;
			});

			t.after("create", (object) => {
				object.name = `A${object.name}Z`;
			});
		});

		fb.factory("user", User, (f) => {
			f.after("build", (user) => {
				user.name = user.name.toLowerCase();
			});
		});

		fb.factory("company", Company, (f) => {
			f.attr("type", () => "Company");

			f.after("build", (company) => {
				company.name = company.name.toUpperCase();
			});
		});
	});

	it("triggers after build callbacks for all factories", async function() {
		let user = await fb.build("user");
		expect(user.name).to.equal("john doe");
		user = await fb.create("user");
		expect(user.name).to.equal("john doe!!!");
		user = await fb.create("user", "awesome");
		expect(user.name).to.equal("A___john doe___!!!Z");
		const company = await fb.build("company");
		expect(company.name).to.equal("ACME SUPPLIERS");
	});
});

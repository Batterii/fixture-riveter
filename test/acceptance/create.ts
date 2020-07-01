import {defineModel} from "../test-fixtures/define-helpers";

import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FactoryBuilder} from "../../lib/factory-builder";

import {expect} from "chai";

describe("#create", function() {
	let fb: FactoryBuilder;
	let User: any;

	before(async function() {
		User = await defineModel("User", {
			name: "string",
			age: "integer",
			email: "string",
		});

		fb = new FactoryBuilder();
		fb.setAdapter(new ObjectionAdapter());

		fb.define(function() {
			fb.factory("user", User, (f) => {
				f.attr("name", () => "Noah");
				f.attr("age", () => 32);
				f.sequence("email", (n) => `test${n}@foo.bar`);
			});
		});
	});

	it("inserts into the database", async function() {
		const user = await fb.create("user", {name: "Bogart"});

		expect(user.id).to.exist;
		expect(user.name).to.equal("Bogart");
		expect(user.email).to.equal("test1@foo.bar");
		expect(user).to.be.an.instanceof(User);

		const model = await User.query().findById(user.id);
		expect(model.id).to.equal(user.id);
	});
});

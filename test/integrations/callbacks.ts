import {User} from "../test-fixtures/user";

import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FactoryBuilder} from "../../lib/factory-builder";

import {expect} from "chai";

describe.only("callback functionality", function() {
	let fb: FactoryBuilder;

	beforeEach(function() {
		fb = new FactoryBuilder();
		fb.setAdapter(new ObjectionAdapter());

		fb.after("build", "create", (user) => console.log(user));

		fb.factory("user", User, (f) => {
			f.attr("name", () => "Noah");
			f.attr("age", () => 32);
			f.sequence("email", (n) => `test${n}@foo.bar`);

			f.before("create", (user) => {
				user.age = 33;
			});
			f.after("create", async(user) => {
				await User.query()
					.update({name: user.age.toString()})
					.where("id", user.id);
			});
		});
	});

	it("calls the callbacks in the right order", async function() {
		const user = await fb.create("user");
		const model = await User.query().findById(user.id);

		expect(model.id).to.equal(user.id);
		expect(model.name).to.equal(user.age.toString());
		expect(model.age).to.equal(33);
		expect(model.name).to.equal("33");
	});
});

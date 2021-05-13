import {Model} from "../support/model";
import {createTable} from "../support/define-helpers";
import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";

describe("toBuild", function() {
	let fr: FixtureRiveter;

	class User extends Model {
		id: number;
		name: string;
		age: number;
		email: string;
	}

	before(async function() {
		fr = new FixtureRiveter();
		fr.setAdapter(new ObjectionAdapter());

		fr.trait("100", (t) => {
			t.toBuild((Model_) => {
				const user = new Model_();
				user.id = 100;
				return user;
			});
		});

		fr.fixture("user", User, (f) => {
			f.attr("name", () => "Noah");
			f.attr("age", () => 32);
			f.sequence("email", (n) => `test${n}@foo.bar`);

			f.trait("50", (t) => {
				t.toBuild((Model_) => {
					const user = new Model_();
					user.id = 50;
					return user;
				});
			});

			f.toBuild((Model_) => {
				const user = new Model_();
				user.id = 20;
				return user;
			});

			f.fixture("nested user", (ff) => {
				ff.toSave((user) => {
					user.name = "saved";
					return user;
				});
			});
		});
	});

	it("uses defined toBuild", async function() {
		const user = await fr.build("user");
		expect(user.id).to.equal(20);
	});

	it("can use trait", async function() {
		const user = await fr.build("user", ["50"]);
		expect(user.id).to.equal(50);
	});

	it("can use global trait", async function() {
		const user = await fr.build("user", ["100"]);
		expect(user.id).to.equal(100);
	});

	it("uses parent methods when available", async function() {
		const user = await fr.create("nested user");
		expect(user.id).to.equal(20);
		expect(user.name).to.equal("saved");
	});
});

describe("toBuild", function() {
	let fr: FixtureRiveter;

	class User extends Model {
		id: number;
		name: string;
		age: number;
		email: string;
	}

	before(async function() {
		fr = new FixtureRiveter();
		fr.setAdapter(new ObjectionAdapter());

		fr.trait("100", (t) => {
			t.toBuild<User>((Mode) => {
				const user = new Mode();
				user.id = 100;
				return user;
			});
		});

		fr.fixture("user", User, (f) => {
			f.attr("name", () => "Noah");
			f.attr("age", () => 32);
			f.sequence("email", (n) => `test${n}@foo.bar`);

			f.trait("50", (t) => {
				t.toBuild((Mode) => {
					const user = new Mode();
					user.id = 50;
					return user;
				});
			});

			f.toBuild((Mode) => {
				const user = new Mode();
				user.id = 20;
				return user;
			});
		});
	});

	it("uses defined toBuild", async function() {
		const user = await fr.build("user");
		expect(user.id).to.equal(20);
	});

	it("can use trait", async function() {
		const user = await fr.build("user", ["50"]);
		expect(user.id).to.equal(50);
	});

	it("can use global trait", async function() {
		const user = await fr.build("user", ["100"]);
		expect(user.id).to.equal(100);
	});

	it("passes in the evaluator to access fixture's attributes", async function() {
		fr = new FixtureRiveter();
		fr.setAdapter(new ObjectionAdapter());

		fr.fixture("user", User, (f) => {
			f.attr("name", () => "Noah");
			f.attr("age", () => 32);
			f.sequence("email", (n) => `test${n}@foo.bar`);

			f.toBuild(async(Mode, evaluator) => {
				const user = new Mode();
				user.name = `toBuild ${await evaluator.name()}`;
				return user;
			});
		});

		const user = await fr.build("user");
		expect(user.name).to.equal("toBuild Noah");
	});
});

describe("toSave", function() {
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

		fr.trait("100", (t) => {
			t.toSave(async(instance, Mode) => {
				instance.name = `100 ${instance.name}`;
				return Mode.query().insertAndFetch(instance);
			});
		});

		fr.fixture("user", User, (f) => {
			f.attr("name", () => "Noah");
			f.attr("age", () => 32);
			f.sequence("email", (n) => `test${n}@foo.bar`);

			f.trait("50", (t) => {
				t.toSave((instance, Mode) => {
					instance.name = `50 ${instance.name}`;
					return Mode.query().insertAndFetch(instance);
				});
			});

			f.toSave((instance, Mode) => {
				instance.name = `20 ${instance.name}`;
				return Mode.query().insertAndFetch(instance);
			});
		});
	});

	it("uses defined toSave", async function() {
		const user = await fr.create("user");
		expect(user.name).to.equal("20 Noah");
	});

	it("can use trait", async function() {
		const user = await fr.create("user", ["50"]);
		expect(user.name).to.equal("50 Noah");
	});

	it("can use global trait", async function() {
		const user = await fr.create("user", ["100"]);
		expect(user.name).to.equal("100 Noah");
	});
});

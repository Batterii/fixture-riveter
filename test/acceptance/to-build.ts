import {Model} from "../support/model";
import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";

describe("#toBuild", function() {
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
			t.toBuild((Mode) => {
				const user = new Mode();
				user.id = 100;
				return user;
			});
		});

		fr.fixture("user", User, (f) => {
			f.attr("name", () => "Noah");
			f.attr("age", () => 32);
			f.sequence("email", (n) => `test${n}@foo.bar`);

			f.toBuild((Mode) => {
				const user = new Mode();
				user.id = 20;
				return user;
			});

			f.trait("50", (t) => {
				t.toBuild((Mode) => {
					const user = new Mode();
					user.id = 50;
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
});

import {DummyModel} from "../test-fixtures/dummy-model";
import {Model} from "../test-fixtures/model";
import {createTable} from "../test-fixtures/define-helpers";
import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";

describe("FixtureRiveter", function() {
	describe("nameGuard variations", function() {
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

		specify("strings", async function() {
			await createTable(User);

			fr = new FixtureRiveter();
			fr.setAdapter(new ObjectionAdapter());

			fr.fixture("user", User, (f) => {
				f.attr("name", () => "Noah");
				f.attr("age", () => 32);
			});

			const user = await fr.build("user", {name: "Bogart"});

			expect(user.name).to.equal("Bogart");
			expect(user.age).to.equal(32);
			expect(user).to.be.an.instanceof(User);
		});

		specify("Objection Models", async function() {
			await createTable(User);

			fr = new FixtureRiveter();
			fr.setAdapter(new ObjectionAdapter());

			fr.fixture(User, (f) => {
				f.attr("name", () => "Noah");
				f.attr("age", () => 32);
			});

			const user = await fr.build(User, {name: "Bogart"});

			expect(user.name).to.equal("Bogart");
			expect(user.age).to.equal(32);
			expect(user).to.be.an.instanceof(User);
		});

		specify("normal classes", async function() {
			fr = new FixtureRiveter();

			fr.fixture(DummyModel, (f) => {
				f.attr("name", () => "Noah");
				f.attr("age", () => 32);
			});

			const user = await fr.build(DummyModel, {name: "Bogart"});

			expect(user.name).to.equal("Bogart");
			expect(user.age).to.equal(32);
			expect(user).to.be.an.instanceof(DummyModel);
		});
	});
});

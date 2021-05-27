import {expect} from "chai";
import {FixtureRiveter} from "../../lib/fixture-riveter";
import {createTable} from "../support/define-helpers";
import {Model} from "../support/model";

describe("methodMissing", function() {
	describe("base functionality", function() {
		let fr: FixtureRiveter;

		class User extends Model {
			id: number;
			name: string;
			age: number;
			email: string;
		}

		before(async function() {
			await createTable(User);

			fr = new FixtureRiveter();

			fr.fixture("user", User, (f) => {
				f.name(() => "Noah");
				f.age(() => 32);
				f.email(async(e) => `${await e.name()}@example.com`);
			});
		});

		it("handles using methodMissing", async function() {
			const user = await fr.build("user");

			expect(user.name).to.equal("Noah");
			expect(user.email).to.equal("Noah@example.com");
			expect(user).to.be.an.instanceof(User);
		});
	});

	describe("nested attributes", function() {
		let fr: FixtureRiveter;

		class User extends Model {
			id: number;
			name: string;
			age: number;
			email: string;
		}

		before(async function() {
			await createTable(User);

			fr = new FixtureRiveter();

			fr.fixture("user", User, (f) => {
				f.age(() => 32);
				f.name(async(e) => `${await e.age()}`);
				f.email(async(e) => `${await e.name()}@example.com`);
			});
		});

		it("handles using methodMissing", async function() {
			const user = await fr.build("user");

			expect(user.name).to.equal("32");
			expect(user.email).to.equal("32@example.com");
			expect(user).to.be.an.instanceof(User);
		});
	});
});

import {Model} from "../test-fixtures/model";
import {createTable} from "../test-fixtures/define-helpers";

import {Assembler} from "../../lib/assembler";
import {Strategy} from "../../lib/strategies/strategy";

import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";

class JsonStrategy extends Strategy {
	async relation(fixtureName: string, traitsAndOverrides: any[]): Promise<any> {
		return this.fixtureRiveter.run(fixtureName, "create", traitsAndOverrides);
	}

	async result<T>(assembler: Assembler<T>): Promise<string> {
		const instance = await assembler.toInstance();
		return JSON.stringify(instance);
	}
}

describe("Custom strategies", function() {
	let fr: FixtureRiveter;

	class Post extends Model {
		id: number;
		title: string;

		get props() {
			return {title: "string"};
		}
	}

	describe("string name", function() {
		beforeEach(async function() {
			await createTable(Post);

			fr = new FixtureRiveter();
			fr.setAdapter(new ObjectionAdapter());

			fr.fixture("post", Post, (f) => {
				f.attr("title", () => "The City & The City");

				f.trait("modern", (t) => t.attr("title", () => "Kraken"));
			});

			fr.registerStrategy("json", JsonStrategy);
		});

		it("works with property call", async function() {
			const post = await (fr as any).json("post", ["modern"]);
			const builtPost = await fr.build("post", ["modern"]);

			expect(typeof post).to.equal("string");
			expect(JSON.parse(post)).to.deep.equal(builtPost);
		});

		it("works with run", async function() {
			const post = await fr.run<string>("post", "json", ["modern"]);
			const builtPost = await fr.build("post", ["modern"]);

			expect(typeof post).to.equal("string");
			expect(JSON.parse(post)).to.deep.equal(builtPost);
		});
	});

	describe("class name", function() {
		beforeEach(async function() {
			await createTable(Post);

			fr = new FixtureRiveter();
			fr.setAdapter(new ObjectionAdapter());

			fr.fixture("post", Post, (f) => {
				f.attr("title", () => "The City & The City");

				f.trait("modern", (t) => t.attr("title", () => "Kraken"));
			});

			fr.registerStrategy(JsonStrategy);
		});

		it("works with property call", async function() {
			const post = await (fr as any).JsonStrategy("post", ["modern"]);
			const builtPost = await fr.build("post", ["modern"]);

			expect(typeof post).to.equal("string");
			expect(JSON.parse(post)).to.deep.equal(builtPost);
		});

		it("works with run", async function() {
			const post = await fr.run<string>("post", JsonStrategy, ["modern"]);
			const builtPost = await fr.build("post", ["modern"]);

			expect(typeof post).to.equal("string");
			expect(JSON.parse(post)).to.deep.equal(builtPost);
		});
	});
});

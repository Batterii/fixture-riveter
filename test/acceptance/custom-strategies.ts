import {Model as ObjectionModel} from "objection";
import {createTable} from "../test-fixtures/define-helpers";

import {Assembler} from "../../lib/assembler";
import {Strategy} from "../../lib/strategies/strategy";

import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";

/* eslint-disable class-methods-use-this */
export class JsonStrategy extends Strategy {
	async association(fixtureName: string, traitsAndOverrides: any[]): Promise<any> {
		return this.fixtureRiveter.run(fixtureName, "create", traitsAndOverrides);
	}

	async result<T>(assembler: Assembler<T>): Promise<string> {
		const instance = await assembler.toInstance();
		return JSON.stringify(instance);
	}
}

describe("Custom strategies", function() {
	let fr: FixtureRiveter;

	class Post extends ObjectionModel {
		static tableName = "posts";
		id: number;
		title: string;
	}

	before(async function() {
		await createTable(Post, {title: "string"});

		fr = new FixtureRiveter();
		fr.setAdapter(new ObjectionAdapter());
		fr.registerStrategy("json", JsonStrategy);

		fr.fixture("post", Post, (f) => {
			f.attr("title", () => "The City & The City");

			f.trait("modern", (t) => t.attr("title", () => "Kraken"));
		});
	});

	it("works", async function() {
		const post = await (fr as any).json("post", "modern");
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

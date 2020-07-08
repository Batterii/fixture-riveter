import {CreateStrategy} from "../../lib/strategies/create-strategy";
import {defineModel} from "../test-fixtures/define-helpers";

import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";

/* eslint-disable class-methods-use-this */
export class JsonStrategy extends CreateStrategy {
	async result(assembler: any): Promise<any> {
		const instance = await assembler.toInstance();
		return JSON.stringify(instance);
	}
}

describe("Custom strategies", function() {
	let fr: FixtureRiveter;
	let Post: any;

	before(async function() {
		Post = await defineModel("Post", {title: "string"});

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
		const builtPost = await fr.build("post", "modern");

		expect(typeof post).to.equal("string");
		expect(JSON.parse(post)).to.deep.equal(builtPost);
	});
});

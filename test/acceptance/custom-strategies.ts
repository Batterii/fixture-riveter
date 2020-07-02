import {CreateStrategy} from "../../lib/strategies/create-strategy";
import {defineModel} from "../test-fixtures/define-helpers";

import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FactoryBuilder} from "../../lib/factory-builder";

import {expect} from "chai";

/* eslint-disable class-methods-use-this */
export class JsonStrategy extends CreateStrategy {
	async result(assembler: any): Promise<any> {
		const instance = await assembler.toInstance();
		return JSON.stringify(instance);
	}
}

describe("Custom strategies", function() {
	let fb: FactoryBuilder;
	let Post: any;

	before(async function() {
		Post = await defineModel("Post", {title: "string"});

		fb = new FactoryBuilder();
		fb.setAdapter(new ObjectionAdapter());
		fb.registerStrategy("json", JsonStrategy);

		fb.define(function() {
			fb.factory("post", Post, (f) => {
				f.attr("title", () => "The City & The City");

				f.trait("modern", (t) => t.attr("title", () => "Kraken"));
			});
		});
	});

	it("works", async function() {
		const post = await fb["json"]("post", "modern");
		const builtPost = await fb.build("post", "modern");

		expect(typeof post).to.equal("string");
		expect(JSON.parse(post)).to.deep.equal(builtPost);
	});
});

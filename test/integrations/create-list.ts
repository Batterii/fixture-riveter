import {defineModel} from "../test-fixtures/define-helpers";

import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FactoryBuilder} from "../../lib/factory-builder";

import {expect} from "chai";

describe("createList", function() {
	let fb: FactoryBuilder;
	let Post: any;

	before(async function() {
		Post = await defineModel("Post", {title: "string"});

		fb = new FactoryBuilder();
		fb.setAdapter(new ObjectionAdapter());

		fb.define(function() {
			fb.factory("post", Post, (f) => {
				f.attr("title", () => "The City & The City");
			});
		});
	});

	it("inserts into the database", async function() {
		const posts = await fb.createList("post", 4);

		expect(posts).to.have.length(4);
		expect(posts.map((p) => p.title)).to.deep.equal(
			[
				"The City & The City",
				"The City & The City",
				"The City & The City",
				"The City & The City",
			],
		);
	});
});

import {defineModel} from "../test-fixtures/define-helpers";

import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FactoryBuilder} from "../../lib/factory-builder";

import {expect} from "chai";

describe("createPair", function() {
	let fb: FactoryBuilder;
	let Post: any;

	before(async function() {
		Post = await defineModel("Post", {title: "string", author: "string"});

		fb = new FactoryBuilder();
		fb.setAdapter(new ObjectionAdapter());

		fb.define(function() {
			fb.factory("post", Post, (f) => {
				f.attr("author", () => "China Mieville");
				f.attr("title", () => "The City & The City");

				f.trait("modern", (t) => t.attr("title", () => "Kraken"));
			});
		});
	});

	it("inserts into the database", async function() {
		const posts = await fb.createPair("post");

		expect(posts).to.have.length(2);
		for (const post of posts) {
			expect(post.id).to.exist;
			expect(post.author).to.equal("China Mieville");
			expect(post.title).to.equal("The City & The City");
		}
	});

	it("applies traits and overrides", async function() {
		const posts = await fb.createPair("post", "modern", {author: "Noah"});

		expect(posts).to.have.length(2);
		for (const post of posts) {
			expect(post.author).to.equal("Noah");
			expect(post.title).to.equal("Kraken");
		}
	});
});

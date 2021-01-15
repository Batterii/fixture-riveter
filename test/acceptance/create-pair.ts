import {defineModel} from "../test-fixtures/define-helpers";

import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";

describe("createPair", function() {
	let fr: FixtureRiveter;
	let Post: any;

	before(async function() {
		Post = await defineModel("Post", {title: "string", author: "string"});

		fr = new FixtureRiveter();
		fr.setAdapter(new ObjectionAdapter());

		fr.fixture("post", Post, (f) => {
			f.attr("author", () => "China Mieville");
			f.attr("title", () => "The City & The City");

			f.trait("modern", (t) => t.attr("title", () => "Kraken"));
		});
	});

	it("inserts into the database", async function() {
		const posts = await fr.createPair("post");

		expect(posts).to.have.length(2);
		for (const post of posts) {
			expect(post.id).to.exist;
			expect(post.author).to.equal("China Mieville");
			expect(post.title).to.equal("The City & The City");
		}
	});

	it("applies traits and overrides", async function() {
		const posts = await fr.createPair("post", ["modern"], {author: "Noah"});

		for (const post of posts) {
			expect(post.author).to.equal("Noah");
			expect(post.title).to.equal("Kraken");
		}
	});
});

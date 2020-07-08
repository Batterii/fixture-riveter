import {Model as ObjectionModel} from "objection";

import {createTable, defineModel} from "../test-fixtures/define-helpers";

import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";

describe("createList", function() {
	let fr: FixtureRiveter;
	let Post: any;

	before(async function() {
		Post = await defineModel("Post", {title: "string", author: "string", position: "integer"});

		fr = new FixtureRiveter();
		fr.setAdapter(new ObjectionAdapter());

		fr.fixture("post", Post, (f) => {
			f.attr("author", () => "China Mieville");
			f.attr("title", () => "The City & The City");
			f.attr("position", () => Math.floor(Math.random() * 1001));

			f.trait("modern", (t) => t.attr("title", () => "Kraken"));
		});
	});

	it("inserts into the database", async function() {
		const posts = await fr.createList("post", 4);

		expect(posts).to.have.length(4);
		for (const post of posts) {
			expect(post.id).to.exist;
			expect(post.author).to.equal("China Mieville");
			expect(post.title).to.equal("The City & The City");
		}
	});

	it("applies traits and overrides", async function() {
		const posts = await fr.createList("post", 3, "modern", {author: "Noah"});

		for (const post of posts) {
			expect(post.author).to.equal("Noah");
			expect(post.title).to.equal("Kraken");
		}
	});

	describe("callback", function() {
		it("it works on both object and index", async function() {
			const posts = await fr.createList("post", 5, (post) => {
				post.position = post.id;
			});

			posts.forEach((post) => {
				expect(post.position).to.equal(post.id);
			});
		});

		it("it works on both object and index", async function() {
			const posts = await fr.createList("post", 5, (post, idx) => {
				post.position = idx;
			});

			posts.forEach((post, idx) => {
				expect(post.position).to.equal(idx);
			});
		});
	});
});

import {Model} from "../test-fixtures/model";
import {createTable} from "../test-fixtures/define-helpers";
import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";

describe("createList", function() {
	let fr: FixtureRiveter;

	class Post extends Model {
		title: string;
		author: string;
		position: number;

		get props() {
			return {
				title: "string",
				author: "string",
				position: "integer",
			};
		}
	}

	before(async function() {
		await createTable(Post);

		fr = new FixtureRiveter();
		fr.setAdapter(new ObjectionAdapter());

		fr.fixture("post", Post, (f) => {
			f.attr("author", () => "China Mieville");
			f.attr("title", () => "The City & The City");

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
		const posts = await fr.createList("post", 3, ["modern"], {author: "Noah"});

		for (const post of posts) {
			expect(post.author).to.equal("Noah");
			expect(post.title).to.equal("Kraken");
		}
	});
});

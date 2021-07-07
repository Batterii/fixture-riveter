// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Model} from "../support/model";
import {createTable} from "../support/define-helpers";
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

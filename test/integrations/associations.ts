import {defineModel} from "../test-fixtures/define-helpers";

import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FactoryBuilder} from "../../lib/factory-builder";

import {expect} from "chai";

describe("associations", function() {
	let fb: FactoryBuilder;
	let User: any;
	let Post: any;

	before(async function() {
		User = await defineModel("User", {
			name: "string",
			age: "integer",
		});

		Post = await defineModel("Post", {
			body: "string",
		});

		fb = new FactoryBuilder();
		fb.setAdapter(new ObjectionAdapter());

		fb.define(function() {
			fb.factory("user", User, (f: any) => {
				f.attr("name", () => "Noah");
				f.attr("age", () => 32);
			});
			fb.factory("post", Post, (f: any) => {
				f.association("user");
				f.attr("body", () => "Post body");
			});
		});
	});

	specify("attributesFor doesn't create an association", async function() {
		const post = await fb.attributesFor("post");
		expect(post).to.be.an.instanceof(Object);
		expect(post.body).to.equal("Post body");
		expect(post.user).to.be.undefined;
	});

	specify("build creates an association", async function() {
		const post = await fb.build("post");
		expect(post).to.be.an.instanceof(Post);
		expect(post.body).to.equal("Post body");
		expect(post.user).to.be.an.instanceof(User);
		expect(post.user.name).to.equal("Noah");
	});
});

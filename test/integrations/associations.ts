import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FactoryBuilder} from "../../lib/factory-builder";

import {Model} from "objection";

import {expect} from "chai";

class User extends Model {
	static tableName = "users";

	id: string;
	name: string;
	age: number;
}

class Post extends Model {
	static tableName = "posts";

	id: string;
	user: User;
	body: string;
}

describe("associations", function() {
	let fb: FactoryBuilder;

	beforeEach(function() {
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

	specify("can be created", async function() {
		const post = await fb.build("post");
		expect(post).to.be.an.instanceof(Post);
		expect(post.body).to.equal("Post body");
		expect(post.user).to.be.an.instanceof(User);
		expect(post.user.name).to.equal("Noah");
	});
});
